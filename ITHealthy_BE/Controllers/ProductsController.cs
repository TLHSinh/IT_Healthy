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
    public class ProductsController : ControllerBase
    {        
        private readonly ITHealthyDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public ProductsController(ITHealthyDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        // ✅ GET ALL
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetAll()
        {
            var products = await _context.Products.Include(p => p.Category)
            .Select(p => new
            {
                p.ProductId,
                p.CategoryId,
                CategoryName = p.Category != null ? p.Category.CategoryName : null,
                p.ProductName,
                p.DescriptionProduct,
                p.BasePrice,
                p.Calories,
                p.Protein,
                p.Carbs,
                p.Fat,
                p.ImageProduct,
                p.IsAvailable,
                p.CreatedAt
            })
            .ToListAsync();
            return Ok(products);
        }

        // ✅ GET BY ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.ProductId == id)
                .Select(p => new
                {
                    p.ProductId,
                    p.CategoryId,
                    CategoryName = p.Category != null ? p.Category.CategoryName : null,
                    p.ProductName,
                    p.DescriptionProduct,
                    p.BasePrice,
                    p.Calories,
                    p.Protein,
                    p.Carbs,
                    p.Fat,
                    p.ImageProduct,
                    p.IsAvailable,
                    p.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm!" });

            return Ok(product);
        }

        [HttpPost]
        public async Task<ActionResult<Product>> CreateProducts ([FromForm] ProductRequetsDTO request)
        {
            string? imageUrl = null;
            if (request.ImageProduct != null && request.ImageProduct.Length > 0)
                        {
                                imageUrl = await _cloudinaryService.UploadImageAsync(request.ImageProduct);
            }

            var product = new Product
            {
                CategoryId = request.CategoryId,
                ProductName = request.ProductName,
                DescriptionProduct = request.DescriptionProduct,
                BasePrice = request.BasePrice,
                Calories = request.Calories,
                Protein = request.Protein,
                Carbs = request.Carbs,
                Fat = request.Fat,
                ImageProduct = imageUrl,
                // IsAvailable = request.IsAvailable ?? true,
                CreatedAt = DateTime.Now
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // return Ok(product);
            return CreatedAtAction(nameof(GetById), new { id = product.ProductId }, new
            {
                message = "Tạo sản phẩm thành công!",
                product
            });
        }

        // ✅ UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] ProductRequetsDTO request)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm!" });

            if (request.ImageProduct != null && request.ImageProduct.Length > 0)
                product.ImageProduct = await _cloudinaryService.UploadImageAsync(request.ImageProduct);

            product.CategoryId = request.CategoryId;
            product.ProductName = request.ProductName;
            product.DescriptionProduct = request.DescriptionProduct;
            product.BasePrice = request.BasePrice;
            product.Calories = request.Calories;
            product.Protein = request.Protein;
            product.Carbs = request.Carbs;
            product.Fat = request.Fat;
            product.IsAvailable = request.IsAvailable ?? product.IsAvailable;

            await _context.SaveChangesAsync();

            return Ok(product);
        }

        // ✅ DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm!" });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa sản phẩm thành công!" });
        }
    }
}
