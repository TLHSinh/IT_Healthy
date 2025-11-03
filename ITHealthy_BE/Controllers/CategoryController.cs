using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public CategoryController(ITHealthyDbContext context)
        {
            _context = context;
        }


        // 🔹 GET: http://localhost:5000/api/category/category_pro
        [HttpGet("category_pro")]
        public async Task<ActionResult<IEnumerable<CategoryProDTO>>> getCategoryPro()
        {
            var category_pro = await _context.Categories
                .Select(p => new CategoryProDTO
                {
                    CategoryId = p.CategoryId,
                    CategoryName = p.CategoryName,
                    DescriptionCat = p.DescriptionCat
                })
                .ToListAsync();
            return Ok(category_pro);
        }



        // 🔹 GET: http://localhost:5000/api/category/category_ing
        [HttpGet("category_ing")]
        public async Task<ActionResult<IEnumerable<CategoryIngDTO>>> getCategoryIng()
        {
            var category_ing = await _context.CategoriesIngredients
                .Select(p => new CategoryIngDTO
                {
                    CategoriesIngredientsId = p.CategoriesIngredientsId,
                    CategoryName = p.CategoryName,
                    DescriptionCat = p.DescriptionCat
                })
                .ToListAsync();
            return Ok(category_ing);
        }

        [HttpGet("category_pro/{id}")]
        public async Task<IActionResult> GetByIdCategoryPro(int id)
        {
            var catePro = await _context.Categories.FindAsync(id);
            if (catePro == null)
                return NotFound(new { message = "Không tìm thấy loại sản phẩm." });

            return Ok(catePro);
        }

        [HttpGet("category_ing/{id}")]
        public async Task<IActionResult> GetByIdCategoryIng(int id)
        {
            var cateIng = await _context.CategoriesIngredients.FindAsync(id);
            if (cateIng == null)
                return NotFound(new { message = "Không tìm thấy loại nguyên liệu." });

            return Ok(cateIng);
        }

        [HttpPost("category_pro")]
        public async Task<IActionResult> CreateCatePro([FromBody] Category catePro)
        {

            _context.Categories.Add(catePro);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tạo loại sản phẩm thành công!",
                data = catePro
            });
        }

        [HttpPost("category_ing")]
        public async Task<IActionResult> CreateCateIng([FromBody] CategoriesIngredient cateIng)
        {

            _context.CategoriesIngredients.Add(cateIng);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Tạo loại nguyên liệu thành công!",
                data = cateIng
            });
        }

        [HttpPut("category_pro/{id}")]
        public async Task<IActionResult> UpdateCatePro(int id, [FromBody] Category catePro)
        {
            var categoryPro = await _context.Categories.FindAsync(id);
            if (categoryPro == null)
                return NotFound(new { message = "Không tìm thấy loại sản phẩm." });

            categoryPro.CategoryName = catePro.CategoryName;
            categoryPro.DescriptionCat = catePro.DescriptionCat;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật loại sản phẩm thành công!", categoryPro });
        }

        [HttpPut("category_ing/{id}")]
        public async Task<IActionResult> UpdateCateIng(int id, [FromBody] CategoriesIngredient cateIng)
        {
            var categoryIng = await _context.CategoriesIngredients.FindAsync(id);
            if (categoryIng == null)
                return NotFound(new { message = "Không tìm thấy loại nguyên liệu." });

            categoryIng.CategoryName = cateIng.CategoryName;
            categoryIng.DescriptionCat = cateIng.DescriptionCat;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật loại nguyên liệu thành công!", categoryIng });
        }

        [HttpDelete("category_pro/{id}")]
        public async Task<IActionResult> DeleteCatePro(int id)
        {
            var catePro = await _context.Categories.FindAsync(id);
            if (catePro == null)
                return NotFound(new { message = "Không tìm thấy loại sản phẩm." });

            _context.Categories.Remove(catePro);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa loại sản phẩm thành công!" });
        }

        [HttpDelete("category_ing/{id}")]
        public async Task<IActionResult> DeleteCateIng(int id)
        {
            var cateIng = await _context.CategoriesIngredients.FindAsync(id);
            if (cateIng == null)
                return NotFound(new { message = "Không tìm thấy loại nguyên liệu." });

            _context.CategoriesIngredients.Remove(cateIng);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa loại nguyên liệu thành công!" });
        }
    }
}