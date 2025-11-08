using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductIngredientsController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public ProductIngredientsController(ITHealthyDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.ProductIngredients
                .Include(pi => pi.Product)
                .Include(pi => pi.Ingredient)
                .Select(pi => new
                {
                    pi.ProductIngredientId,
                    pi.ProductId,
                    ProductName = pi.Product != null ? pi.Product.ProductName : null,
                    pi.IngredientId,
                    IngredientName = pi.Ingredient != null ? pi.Ingredient.IngredientName : null,
                    pi.Quantity
                })
                .ToListAsync();

            return Ok(list);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pi = await _context.ProductIngredients
                .Include(p => p.Product)
                .Include(i => i.Ingredient)
                .FirstOrDefaultAsync(p => p.ProductIngredientId == id);

            if (pi == null)
                return NotFound(new { message = "Không tìm thấy dữ liệu!" });

            return Ok(new
            {
                pi.ProductIngredientId,
                pi.ProductId,
                ProductName = pi.Product != null ? pi.Product.ProductName : null,
                pi.IngredientId,
                IngredientName = pi.Ingredient != null ? pi.Ingredient.IngredientName : null,
                pi.Quantity
            });
        }

     
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var list = await _context.ProductIngredients
                .Include(i => i.Ingredient)
                .Where(p => p.ProductId == productId)
                .Select(p => new
                {
                    p.ProductIngredientId,
                    p.ProductId,
                    p.IngredientId,
                    IngredientName = p.Ingredient != null ? p.Ingredient.IngredientName : null,
                    p.Quantity
                })
                .ToListAsync();

            return Ok(list);
        }

        
        [HttpGet("ingredient/{ingredientId}")]
        public async Task<IActionResult> GetByIngredient(int ingredientId)
        {
            var list = await _context.ProductIngredients
                .Include(p => p.Product)
                .Where(i => i.IngredientId == ingredientId)
                .Select(i => new
                {
                    i.ProductIngredientId,
                    i.IngredientId,
                    i.ProductId,
                    ProductName = i.Product != null ? i.Product.ProductName : null,
                    i.Quantity
                })
                .ToListAsync();

            return Ok(list);
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductIngredient dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra trùng Product + Ingredient
            var exists = await _context.ProductIngredients
                .AnyAsync(p => p.ProductId == dto.ProductId && p.IngredientId == dto.IngredientId);

            if (exists)
                return BadRequest(new { message = "Nguyên liệu này đã được gán cho sản phẩm!" });

            var newPI = new ProductIngredient
            {
                ProductId = dto.ProductId,
                IngredientId = dto.IngredientId,
                Quantity = dto.Quantity
            };

            _context.ProductIngredients.Add(newPI);
            await _context.SaveChangesAsync();

            var product = await _context.Products.FindAsync(dto.ProductId);
            var ingredient = await _context.Ingredients.FindAsync(dto.IngredientId);

            return Ok(new
            {
                message = "Thêm nguyên liệu vào sản phẩm thành công!",
                data = new
                {
                    newPI.ProductIngredientId,
                    ProductName = product?.ProductName,
                    IngredientName =  ingredient?.IngredientName,
                    newPI.Quantity
                }
            });
        }

     
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductIngredient dto)
        {
            var pi = await _context.ProductIngredients.FindAsync(id);

            if (pi == null)
                return NotFound(new { message = "Không tìm thấy dữ liệu để cập nhật!" });

            // Kiểm tra trùng ProductID + IngredientID (ngoại trừ chính nó)
            var duplicate = await _context.ProductIngredients
                .AnyAsync(p => p.ProductId == dto.ProductId &&
                               p.IngredientId == dto.IngredientId &&
                               p.ProductIngredientId != id);

            if (duplicate)
                return BadRequest(new { message = "Cặp Product - Ingredient đã tồn tại!" });

            pi.ProductId = dto.ProductId;
            pi.IngredientId = dto.IngredientId;
            pi.Quantity = dto.Quantity;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật thành công!", data = pi });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var pi = await _context.ProductIngredients.FindAsync(id);

            if (pi == null)
                return NotFound(new { message = "Không tìm thấy dữ liệu!" });

            _context.ProductIngredients.Remove(pi);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa thành công!" });
        }
    }
}
