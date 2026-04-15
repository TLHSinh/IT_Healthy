using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using ITHealthy.Services;
using Microsoft.AspNetCore.Authorization;
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

        private async Task<string?> ValidateProductRequest(ProductDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.ProductName))
                return "Tên sản phẩm không được để trống.";

            if (request.BasePrice.HasValue && request.BasePrice < 0)
                return "Giá sản phẩm phải lớn hơn hoặc bằng 0.";

            if (request.Calories.HasValue && request.Calories < 0 ||
                request.Protein.HasValue && request.Protein < 0 ||
                request.Carbs.HasValue && request.Carbs < 0 ||
                request.Fat.HasValue && request.Fat < 0)
            {
                return "Các chỉ số dinh dưỡng phải lớn hơn hoặc bằng 0.";
            }

            if (request.CategoryId.HasValue)
            {
                var categoryExists = await _context.Categories
                    .AnyAsync(c => c.CategoryId == request.CategoryId.Value);

                if (!categoryExists)
                    return "Danh mục sản phẩm không tồn tại.";
            }

            return null;
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
                    CategoryId = p.CategoryId,
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

        //POST: http://localhost:5000/api/products/add

        [Authorize(Roles = "Admin")]
        [HttpPost("add")]
        public async Task<IActionResult> AddProduct([FromForm] ProductDTO request)
        {
            var validationMessage = await ValidateProductRequest(request);
            if (validationMessage != null)
                return BadRequest(new { message = validationMessage });

            string? imageUrl = null;

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                // ✅ Upload lên Cloudinary, lưu ảnh vào folder products_images
                imageUrl = await _cloudinaryService.UploadImageAsync(request.ImageFile);
            }

            var product = new Product
            {
                ProductName = request.ProductName,
                DescriptionProduct = request.DescriptionProduct,
                BasePrice = request.BasePrice,
                Calories = request.Calories,
                Protein = request.Protein,
                Carbs = request.Carbs,
                Fat = request.Fat,
                ImageProduct = imageUrl,
                CategoryId = request.CategoryId,
                IsAvailable = request.IsAvailable ?? true,
                CreatedAt = DateTime.Now
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Thêm sản phẩm thành công!",
                data = new
                {
                    product.ProductId,
                    product.ProductName,
                    product.BasePrice,
                    product.ImageProduct
                }
            });
        }


        //PUT: http://localhost:5000/api/products/update/{id}
        [Authorize(Roles = "Admin")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductDTO request)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm!" });

            var validationMessage = await ValidateProductRequest(request);
            if (validationMessage != null)
                return BadRequest(new { message = validationMessage });

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                // ✅ Upload ảnh mới lên Cloudinary
                var imageUrl = await _cloudinaryService.UploadImageProductAsync(request.ImageFile);
                product.ImageProduct = imageUrl;
            }

            // Cập nhật thông tin
            product.ProductName = request.ProductName;
            product.DescriptionProduct = request.DescriptionProduct;
            product.BasePrice = request.BasePrice;
            product.Calories = request.Calories;
            product.Protein = request.Protein;
            product.Carbs = request.Carbs;
            product.Fat = request.Fat;
            product.CategoryId = request.CategoryId;
            product.IsAvailable = request.IsAvailable;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật sản phẩm thành công!",
                data = new
                {
                    product.ProductId,
                    product.ProductName,
                    product.ImageProduct
                }
            });
        }

        //DELETE: http://localhost:5000/api/products/delete/{id}
        [Authorize(Roles = "Admin")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm." });

            try
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                return BadRequest(new
                {
                    message = "Không thể xóa sản phẩm vì đang có dữ liệu liên quan."
                });
            }

            return Ok(new { message = "Xóa sản phẩm thành công." });
        }



    }
}
