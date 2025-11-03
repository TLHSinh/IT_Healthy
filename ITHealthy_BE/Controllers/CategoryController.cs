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
                    DescriptionCat = p.DescriptionCat,
                    ImageCategories = p.ImageCategories
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
    }
}