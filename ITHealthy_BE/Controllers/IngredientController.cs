using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using ITHealthy.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ITHealthy.Controllers;


namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class IngredientController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public IngredientController(ITHealthyDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }


        // 🔹 GET: http://localhost:5000/api/ingredient/all-ingredients
        [HttpGet("all-ingredients")]
        public async Task<ActionResult<IEnumerable<IngredientDTO>>> GetAllIngredients()
        {
            var ingredients = await _context.Ingredients
                .Include(i => i.CategoriesIngredients)
                .Select(i => new IngredientDTO
                {
                    IngredientId = i.IngredientId,
                    IngredientName = i.IngredientName,
                    CategoriesIngredientsId = i.CategoriesIngredientsId,
                    Unit = i.Unit,
                    BasePrice = i.BasePrice,
                    Calories = i.Calories,
                    Protein = i.Protein,
                    Carbs = i.Carbs,
                    Fat = i.Fat,
                    ImageIngredients = i.ImageIngredients,
                    CreatedAt = i.CreatedAt,
                    IsAvailable = i.IsAvailable,
                    CategoryName = i.CategoriesIngredients != null
                        ? i.CategoriesIngredients.CategoryName
                        : null
                })
                .ToListAsync();

            return Ok(ingredients);
        }

        // 🔹 GET: http://localhost:5000/api/ingredient/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<IngredientDTO>> GetIngredientById(int id)
        {
            var ingredient = await _context.Ingredients
                .Include(i => i.CategoriesIngredients)
                .Where(i => i.IngredientId == id)
                .Select(i => new IngredientDTO
                {
                    IngredientId = i.IngredientId,
                    IngredientName = i.IngredientName,
                    CategoriesIngredientsId = i.CategoriesIngredientsId,
                    Unit = i.Unit,
                    BasePrice = i.BasePrice,
                    Calories = i.Calories,
                    Protein = i.Protein,
                    Carbs = i.Carbs,
                    Fat = i.Fat,
                    ImageIngredients = i.ImageIngredients,
                    CreatedAt = i.CreatedAt,
                    IsAvailable = i.IsAvailable,
                    CategoryName = i.CategoriesIngredients != null
                        ? i.CategoriesIngredients.CategoryName
                        : null
                })
                .FirstOrDefaultAsync();

            if (ingredient == null)
                return NotFound(new { message = "Không tìm thấy nguyên liệu" });

            return Ok(ingredient);
        }




        //  POST: http://localhost:5000/api/ingredient
        [HttpPost]
        public async Task<ActionResult<Ingredient>> CreateIng([FromForm] IngredientRequestDTO request)
        {
            string? imageUrl = null;
            if (request.ImageIngredients != null && request.ImageIngredients.Length > 0)
            {
                imageUrl = await _cloudinaryService.UploadImageAsync(request.ImageIngredients);
            }

            var ing = new Ingredient
            {
                IngredientName = request.IngredientName,
                CategoriesIngredientsId = request.CategoriesIngredientsId,
                Unit = request.Unit,
                BasePrice = request.BasePrice,
                Calories = request.Calories,
                Protein = request.Protein,
                Carbs = request.Carbs,
                Fat = request.Fat,
                ImageIngredients = imageUrl,
                CreatedAt = DateTime.Now,
                IsAvailable = true
            };

            _context.Ingredients.Add(ing);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetIngredientById), new { id = ing.IngredientId }, new
            {
                message = "Tạo nguyên liệu thành công!",
                ing
            });
        }

        //  PUT: http://localhost:5000/api/ingredient/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateIngredient(int id, [FromForm] IngredientRequestDTO request)
        {
            var ingredient = await _context.Ingredients.FindAsync(id);
            if (ingredient == null)
                return NotFound(new { message = "Không tìm thấy nguyên liệu!" });

            // Cập nhật hình ảnh nếu có upload mới
            if (request.ImageIngredients != null && request.ImageIngredients.Length > 0)
            {
                var newImageUrl = await _cloudinaryService.UploadImageAsync(request.ImageIngredients);
                ingredient.ImageIngredients = newImageUrl;
            }

            ingredient.IngredientName = request.IngredientName;
            ingredient.CategoriesIngredientsId = request.CategoriesIngredientsId;
            ingredient.Unit = request.Unit;
            ingredient.BasePrice = request.BasePrice;
            ingredient.Calories = request.Calories;
            ingredient.Protein = request.Protein;
            ingredient.Carbs = request.Carbs;
            ingredient.Fat = request.Fat;
            ingredient.IsAvailable = request.IsAvailable;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật nguyên liệu thành công!",
                data = ingredient
            });
        }

        //  DELETE: http://localhost:5000/api/ingredient/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteIngredient(int id)
        {
            var ingredient = await _context.Ingredients.FindAsync(id);
            if (ingredient == null)
                return NotFound(new { message = "Không tìm thấy nguyên liệu!" });

            _context.Ingredients.Remove(ingredient);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa nguyên liệu thành công!" });
        }
    }
}
