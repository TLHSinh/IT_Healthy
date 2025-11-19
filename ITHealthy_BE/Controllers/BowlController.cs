using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using ITHealthy.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BowlController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public BowlController(ITHealthyDbContext context)
        {
            _context = context;
        }



        private async Task<(bool isValid, List<Ingredient>? ingredients, string? error)>
            ValidateIngredients(List<BowlIngredientRequest> ingredientRequests)
        {
            if (ingredientRequests == null || ingredientRequests.Count == 0)
                return (false, null, "Bowl must contain at least one ingredient.");

            var ids = ingredientRequests.Select(i => i.IngredientId).ToList();
            var ingredients = await _context.Ingredients
                .Where(i => ids.Contains(i.IngredientId))
                .ToListAsync();

            if (ingredients.Count != ids.Count)
            {
                var missing = ids.Except(ingredients.Select(i => i.IngredientId));
                return (false, null, $"Some ingredients do not exist: {string.Join(",", missing)}");
            }

            return (true, ingredients, null);
        }

        private (decimal calories, decimal protein, decimal carbs, decimal fat, decimal price)
            CalculateNutrition(List<BowlIngredientRequest> reqIngredients, List<Ingredient> ingredients)
        {
            decimal cal = 0, pro = 0, carb = 0, fat = 0, price = 0;

            foreach (var item in reqIngredients)
            {
                var ing = ingredients.First(i => i.IngredientId == item.IngredientId);

                cal += (ing.Calories ?? 0) * item.Quantity;
                pro += (ing.Protein ?? 0) * item.Quantity;
                carb += (ing.Carbs ?? 0) * item.Quantity;
                fat += (ing.Fat ?? 0) * item.Quantity;
                price += ing.BasePrice * item.Quantity;
            }

            return (cal, pro, carb, fat, price);
        }

        // ===================================

        //http://localhost:5000/api/bowl/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateBowl([FromBody] CreateBowlRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.BowlName))
                return BadRequest("BowlName is required.");

            // validate ingredients
            var (isValid, ingredients, error) = await ValidateIngredients(request.Ingredients);
            if (!isValid) return BadRequest(error);

            // calculate nutrition
            var (cal, pro, carb, fat, price) = CalculateNutrition(request.Ingredients, ingredients);

            var bowl = new Bowl
            {
                CustomerId = request.CustomerId,
                BowlName = request.BowlName,
                BaseCalories = cal,
                TotalProtein = pro,
                TotalCarbs = carb,
                TotalFat = fat,
                BasePrice = price,
                TotalPrice = price,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bowls.Add(bowl);
            await _context.SaveChangesAsync();

            // create bowl items
            foreach (var item in request.Ingredients)
            {
                var ing = ingredients.First(i => i.IngredientId == item.IngredientId);
                _context.BowlItems.Add(new BowlItem
                {
                    BowlId = bowl.BowlId,
                    IngredientId = ing.IngredientId,
                    Quantity = item.Quantity,
                    Price = ing.BasePrice * item.Quantity
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Bowl created successfully", bowlId = bowl.BowlId });
        }



        [HttpGet("user/{customerId}")]
        public async Task<IActionResult> GetBowlsByCustomer(int customerId)
        {
            var bowls = await _context.Bowls
                .Include(b => b.BowlItems)
                    .ThenInclude(i => i.Ingredient)
                .Where(b => b.CustomerId == customerId)
                .ToListAsync();

            return Ok(bowls.Select(b => new
            {
                b.BowlId,
                b.BowlName,
                b.TotalPrice,
                b.BaseCalories,
                b.TotalProtein,
                b.TotalCarbs,
                b.TotalFat,
                b.CreatedAt,
                Ingredients = b.BowlItems.Select(i => new
                {
                    i.IngredientId,
                    i.Ingredient.IngredientName,
                    i.Quantity,
                    i.Price
                })
            }));
        }


        [HttpPut("update/{bowlId}")]
        public async Task<IActionResult> UpdateBowl(int bowlId, [FromBody] CreateBowlRequest request)
        {
            var bowl = await _context.Bowls.Include(b => b.BowlItems)
                                           .FirstOrDefaultAsync(b => b.BowlId == bowlId);

            if (bowl == null)
                return NotFound("Bowl not found.");

            if (request.Ingredients == null || request.Ingredients.Count == 0)
                return BadRequest("Ingredients cannot be empty.");

            var (isValid, ingredients, error) = await ValidateIngredients(request.Ingredients);
            if (!isValid) return BadRequest(error);

            var (cal, pro, carb, fat, price) = CalculateNutrition(request.Ingredients, ingredients);

            bowl.BowlName = request.BowlName;
            bowl.BaseCalories = cal;
            bowl.TotalProtein = pro;
            bowl.TotalCarbs = carb;
            bowl.TotalFat = fat;
            bowl.TotalPrice = price;

            // Replace items
            _context.BowlItems.RemoveRange(bowl.BowlItems);

            foreach (var item in request.Ingredients)
            {
                var ing = ingredients.First(i => i.IngredientId == item.IngredientId);

                _context.BowlItems.Add(new BowlItem
                {
                    BowlId = bowl.BowlId,
                    IngredientId = ing.IngredientId,
                    Quantity = item.Quantity,
                    Price = ing.BasePrice * item.Quantity
                });
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Bowl updated successfully" });
        }



        [HttpDelete("delete/{bowlId}")]
        public async Task<IActionResult> DeleteBowl(int bowlId)
        {
            var bowl = await _context.Bowls.Include(b => b.BowlItems)
                                           .FirstOrDefaultAsync(b => b.BowlId == bowlId);

            if (bowl == null)
                return NotFound("Bowl not found.");

            _context.BowlItems.RemoveRange(bowl.BowlItems);
            _context.Bowls.Remove(bowl);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bowl deleted successfully" });
        }


        [HttpPost("clone-to-cart/{bowlId}")]
        public async Task<IActionResult> CloneBowlToCart(int bowlId, [FromQuery] int customerId)
        {
            var bowl = await _context.Bowls.FirstOrDefaultAsync(b => b.BowlId == bowlId);
            if (bowl == null) return NotFound("Bowl not found.");

            var cart = await _context.Carts.Include(c => c.CartItems)
                                           .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null)
            {
                cart = new Cart
                {
                    CustomerId = customerId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            var item = cart.CartItems.FirstOrDefault(i => i.BowlId == bowlId);

            if (item != null)
            {
                item.Quantity++;
                item.AddedAt = DateTime.UtcNow;
            }
            else
            {
                _context.CartItems.Add(new CartItem
                {
                    CartId = cart.CartId,
                    BowlId = bowl.BowlId,
                    Quantity = 1,
                    UnitPrice = bowl.TotalPrice,
                    AddedAt = DateTime.UtcNow
                });
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bowl added to cart successfully" });
        }
    }
}