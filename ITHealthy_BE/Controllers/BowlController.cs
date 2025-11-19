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

        [HttpPost("create")]
        public async Task<IActionResult> CreateBowl([FromBody] CreateBowlRequest request)
        {
            if (request.Ingredients == null || !request.Ingredients.Any())
                return BadRequest("Bowl must contain at least one ingredient.");

            // Lấy danh sách Ingredient từ DB
            var ingredientIds = request.Ingredients.Select(i => i.IngredientId).ToList();
            var ingredients = await _context.Ingredients
                .Where(i => ingredientIds.Contains(i.IngredientId))
                .ToListAsync();

            if (ingredients.Count != ingredientIds.Count)
                return BadRequest("Some ingredients do not exist.");

            // Tính toán nutrition
            decimal totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalPrice = 0;

            foreach (var item in request.Ingredients)
            {
                var ing = ingredients.First(i => i.IngredientId == item.IngredientId);

                totalCalories += (ing.Calories ?? 0) * item.Quantity;
                totalProtein += (ing.Protein ?? 0) * item.Quantity;
                totalCarbs += (ing.Carbs ?? 0) * item.Quantity;
                totalFat += (ing.Fat ?? 0) * item.Quantity;
                totalPrice += ing.BasePrice * item.Quantity;
            }

            // Tạo Bowl
            var bowl = new Bowl
            {
                CustomerId = request.CustomerId,
                BowlName = request.BowlName,
                BaseCalories = totalCalories,
                TotalProtein = totalProtein,
                TotalCarbs = totalCarbs,
                TotalFat = totalFat,
                BasePrice = totalPrice,
                TotalPrice = totalPrice,
                CreatedAt = DateTime.Now
            };

            _context.Bowls.Add(bowl);
            await _context.SaveChangesAsync();

            // Tạo BowlItem
            foreach (var item in request.Ingredients)
            {
                var ingredient = ingredients.First(i => i.IngredientId == item.IngredientId);

                var bowlItem = new BowlItem
                {
                    BowlId = bowl.BowlId,
                    IngredientId = ingredient.IngredientId,
                    Quantity = item.Quantity,
                    Price = ingredient.BasePrice * item.Quantity
                };

                _context.BowlItems.Add(bowlItem);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Bowl created successfully",
                bowlId = bowl.BowlId
            });
        }



        [HttpGet("user/{customerId}")]
        public async Task<IActionResult> GetBowlsByCustomer(int customerId)
        {
            var bowls = await _context.Bowls
                .Include(b => b.BowlItems)
                    .ThenInclude(bi => bi.Ingredient)
                .Where(b => b.CustomerId == customerId)
                .ToListAsync();

            var result = bowls.Select(b => new
            {
                b.BowlId,
                b.BowlName,
                b.TotalPrice,
                b.BaseCalories,
                b.TotalProtein,
                b.TotalCarbs,
                b.TotalFat,
                b.CreatedAt,
                Ingredients = b.BowlItems.Select(bi => new
                {
                    bi.IngredientId,
                    bi.Ingredient.IngredientName,
                    bi.Quantity,
                    bi.Price
                })
            });

            return Ok(result);
        }



        [HttpPut("update/{bowlId}")]
        public async Task<IActionResult> UpdateBowl(int bowlId, [FromBody] CreateBowlRequest request)
        {
            var bowl = await _context.Bowls
                .Include(b => b.BowlItems)
                .FirstOrDefaultAsync(b => b.BowlId == bowlId);

            if (bowl == null)
                return NotFound("Bowl not found.");

            bowl.BowlName = request.BowlName;

            // Xóa các BowlItem cũ
            _context.BowlItems.RemoveRange(bowl.BowlItems);

            // Lấy các ingredient mới
            var ingredientIds = request.Ingredients.Select(i => i.IngredientId).ToList();
            var ingredients = await _context.Ingredients
                .Where(i => ingredientIds.Contains(i.IngredientId))
                .ToListAsync();

            decimal totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0, totalPrice = 0;

            foreach (var item in request.Ingredients)
            {
                var ing = ingredients.First(i => i.IngredientId == item.IngredientId);
                totalCalories += (ing.Calories ?? 0) * item.Quantity;
                totalProtein += (ing.Protein ?? 0) * item.Quantity;
                totalCarbs += (ing.Carbs ?? 0) * item.Quantity;
                totalFat += (ing.Fat ?? 0) * item.Quantity;
                totalPrice += ing.BasePrice * item.Quantity;

                var bowlItem = new BowlItem
                {
                    BowlId = bowl.BowlId,
                    IngredientId = ing.IngredientId,
                    Quantity = item.Quantity,
                    Price = ing.BasePrice * item.Quantity
                };
                _context.BowlItems.Add(bowlItem);
            }

            bowl.BaseCalories = totalCalories;
            bowl.TotalProtein = totalProtein;
            bowl.TotalCarbs = totalCarbs;
            bowl.TotalFat = totalFat;
            bowl.TotalPrice = totalPrice;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Bowl updated successfully" });
        }


        [HttpDelete("delete/{bowlId}")]
        public async Task<IActionResult> DeleteBowl(int bowlId)
        {
            var bowl = await _context.Bowls
                .Include(b => b.BowlItems)
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
            var bowl = await _context.Bowls
                .Include(b => b.BowlItems)
                    .ThenInclude(bi => bi.Ingredient)
                .FirstOrDefaultAsync(b => b.BowlId == bowlId);

            if (bowl == null)
                return NotFound("Bowl not found.");

            // Lấy giỏ hàng customer
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null)
            {
                cart = new Cart
                {
                    CustomerId = customerId,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            // Thêm Bowl vào cart
            var existingItem = cart.CartItems.FirstOrDefault(i => i.BowlId == bowlId);
            if (existingItem != null)
            {
                existingItem.Quantity += 1;
                existingItem.AddedAt = DateTime.Now;
            }
            else
            {
                var cartItem = new CartItem
                {
                    CartId = cart.CartId,
                    BowlId = bowl.BowlId,
                    Quantity = 1,
                    UnitPrice = bowl.TotalPrice,
                    AddedAt = DateTime.Now
                };
                _context.CartItems.Add(cartItem);
            }

            cart.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Bowl cloned to cart successfully" });
        }

    }

}
