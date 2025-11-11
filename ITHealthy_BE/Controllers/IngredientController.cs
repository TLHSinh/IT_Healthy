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


        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ingredient>>> GetAllIng()
        {
            return await _context.Ingredients.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Ingredient>> GetByIdIng(int id)
        {
            var ingredient = await _context.Ingredients.FindAsync(id);
            if (ingredient == null)
                return NotFound();

            return ingredient;
        }

        [HttpPost]
        public async Task<ActionResult<Ingredient>> CreateIng([FromForm] IngredientRequestDTO request)
        {
            string? avatarUrl = null;
            if (request.ImageIngredients != null && request.ImageIngredients.Length > 0)
            {
                avatarUrl = await _cloudinaryService.UploadImageAsync(request.ImageIngredients);
            }

            var ing = new Ingredient
            {
                IngredientName = request.IngredientName,
                Unit = request.Unit,
                BasePrice = request.BasePrice,
                Calories = request.Calories,
                Protein = request.Protein,
                Carbs = request.Carbs,
                Fat = request.Fat,
                ImageIngredients = avatarUrl,
            };

            _context.Ingredients.Add(ing);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByIdIng), new { id = ing.IngredientId }, new
            {
                message = "Tạo nguyên liệu thành công!",
                ing
            });
        }

        // PUT: api/customers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] IngredientRequestDTO request)
        {
            var ing = await _context.Ingredients.FindAsync(id);
            if (ing == null)
                return NotFound(new { message = "Không tìm thấy nguyên liệu!" });

            if (request.ImageIngredients != null && request.ImageIngredients.Length > 0)
            {
                var avatarUrl = await _cloudinaryService.UploadImageAsync(request.ImageIngredients);
                ing.ImageIngredients = avatarUrl;
            }

            ing.IngredientName = request.IngredientName;
            ing.Unit = request.Unit;
            ing.BasePrice = request.BasePrice;
            ing.Calories = request.Calories;
            ing.Protein = request.Protein;
            ing.Carbs = request.Carbs;
            ing.Fat = request.Fat;
            ing.ImageIngredients= ing.ImageIngredients;
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật thông tin khách hàng thành công!",
                data = ing
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ing = await _context.Ingredients.FindAsync(id);
            if (ing == null)
                return NotFound();

            _context.Ingredients.Remove(ing);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa nguyên liệu thành công!" });
        }
    }
}