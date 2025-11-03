using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public ProductsController(ITHealthyDbContext context)
        {
            _context = context;
        }

        // 🔹 GET: http://localhost:5000/api/products/all-products
        [HttpGet("all-products")]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Select(p => new ProductDTO
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    BasePrice = p.BasePrice,
                    IsAvailable = p.IsAvailable,
                    DescriptionProduct = p.DescriptionProduct,
                    ImageProduct = p.ImageProduct,
                    CategoryName = p.Category != null ? p.Category.CategoryName : null,
                    Calories = p.Calories,
                    Protein = p.Protein,
                    Carbs = p.Carbs,
                    Fat = p.Fat
                })
                .ToListAsync();

            return Ok(products);
        }

        // 🔹 GET: http://localhost:5000/api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDTO>> GetProductById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.ProductId == id)
                .Select(p => new ProductDTO
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    BasePrice = p.BasePrice,
                    IsAvailable = p.IsAvailable,
                    DescriptionProduct = p.DescriptionProduct,
                    ImageProduct = p.ImageProduct,
                    CategoryName = p.Category != null ? p.Category.CategoryName : null,
                    Calories = p.Calories,
                    Protein = p.Protein,
                    Carbs = p.Carbs,
                    Fat = p.Fat

                })
                .FirstOrDefaultAsync();

            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm" });

            return Ok(product);
        }
    }
}