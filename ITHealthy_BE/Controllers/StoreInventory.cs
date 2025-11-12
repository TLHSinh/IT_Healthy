using System.Security.Cryptography.X509Certificates;
using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoreInventoryController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public StoreInventoryController(ITHealthyDbContext context)
        {
            _context = context;
        }


        // http://localhost:5000/api/StoreInventory/
        // ✅ GET BY STORE
        [HttpGet("store/{storeId}")]
        public async Task<IActionResult> GetByStore(int storeId)
        {
            var list = await _context.StoreInventories
                .Include(i => i.Ingredient)
                .Where(s => s.StoreId == storeId)
                .Select(s => new
                {
                    s.StoreIngredientId,
                    s.IngredientId,
                    IngredientName = s.Ingredient != null ? s.Ingredient.IngredientName : null,
                    s.StockQuantity,
                    s.ReorderLevel,
                    s.LastUpdated
                })
                .ToListAsync();

            return Ok(list);
        }

        // ✅ GET BY INGREDIENT
        [HttpGet("ingredient/{ingredientId}")]
        public async Task<IActionResult> GetByIngredient(int ingredientId)
        {
            var list = await _context.StoreInventories
                .Include(s => s.Store)
                .Where(s => s.IngredientId == ingredientId)
                .Select(s => new
                {
                    s.StoreIngredientId,
                    s.StoreId,
                    StoreName = s.Store != null ? s.Store.StoreName : null,
                    s.StockQuantity,
                    s.ReorderLevel,
                    s.LastUpdated
                })
                .ToListAsync();

            return Ok(list);
        }

        // ✅ CREATE: http://localhost:5000/api/StoreInventory/
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StoreInventory dto)
        {
            // Kiểm tra trùng
            var exists = await _context.StoreInventories
                .AnyAsync(si => si.StoreId == dto.StoreId && si.IngredientId == dto.IngredientId);

            if (exists)
                return BadRequest(new { message = "Nguyên liệu này đã tồn tại trong kho của cửa hàng!" });

            dto.LastUpdated = DateTime.UtcNow;

            _context.StoreInventories.Add(dto);
            await _context.SaveChangesAsync();

            var store = await _context.Stores.FindAsync(dto.StoreId);
            var ingredient = await _context.Ingredients.FindAsync(dto.IngredientId);

            return Ok(new
            {
                message = "Thêm nguyên liệu vào kho cửa hàng thành công!",
                data = new
                {
                    dto.StoreIngredientId,
                    dto.StoreId,
                    StoreName = store?.StoreName,
                    dto.IngredientId,
                    IngredientName = ingredient?.IngredientName,
                    dto.StockQuantity,
                    dto.ReorderLevel,
                    dto.LastUpdated
                }
            });
        }

        // ✅ UPDATE
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] StoreInventory dto)
        {
            var si = await _context.StoreInventories.FindAsync(id);

            if (si == null)
                return NotFound(new { message = "Không tìm thấy dữ liệu để cập nhật!" });

            var duplicate = await _context.StoreInventories
                .AnyAsync(x => x.StoreId == dto.StoreId &&
                               x.IngredientId == dto.IngredientId &&
                               x.StoreIngredientId != id);

            if (duplicate)
                return BadRequest(new { message = "Cặp Store - Ingredient đã tồn tại!" });

            // Cập nhật
            si.StoreId = dto.StoreId;
            si.IngredientId = dto.IngredientId;
            si.StockQuantity = dto.StockQuantity ?? si.StockQuantity;
            si.ReorderLevel = dto.ReorderLevel ?? si.ReorderLevel;
            si.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            var store = await _context.Stores.FindAsync(dto.StoreId);
            var ingredient = await _context.Ingredients.FindAsync(dto.IngredientId);

            return Ok(new
            {
                message = "Cập nhật kho cửa hàng thành công!",
                data = new
                {
                    si.StoreIngredientId,
                    si.StoreId,
                    StoreName = store?.StoreName,
                    si.IngredientId,
                    IngredientName = ingredient?.IngredientName,
                    si.StockQuantity,
                    si.ReorderLevel,
                    si.LastUpdated
                }
            });
        }

        // ✅ DELETE
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var si = await _context.StoreInventories.FindAsync(id);

            if (si == null)
                return NotFound(new { message = "Không tìm thấy dữ liệu!" });

            _context.StoreInventories.Remove(si);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa thành công!" });
        }

        
    }
}