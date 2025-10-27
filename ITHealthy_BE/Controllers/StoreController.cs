using ITHealthy.Data;
using ITHealthy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace YourNamespace.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoresController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public StoresController(ITHealthyDbContext context)
        {
            _context = context;
        }

        // ✅ Lấy tất cả cửa hàng
        [HttpGet]
        public async Task<IActionResult> GetAllStores()
        {
            var stores = await _context.Stores.ToListAsync();
            return Ok(stores);
        }

        // ✅ Lấy cửa hàng theo ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStoreById(int id)
        {
            var store = await _context.Stores.FindAsync(id);
            if (store == null)
                return NotFound(new { message = "Không tìm thấy cửa hàng." });

            return Ok(store);
        }

        // ✅ Thêm cửa hàng (ngày phải nhập)
        [HttpPost]
        public async Task<IActionResult> CreateStore([FromBody] Store model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            _context.Stores.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm cửa hàng thành công!", store = model });
        }

        // ✅ Cập nhật cửa hàng
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStore(int id, [FromBody] Store model)
        {
            var store = await _context.Stores.FindAsync(id);
            if (store == null)
                return NotFound(new { message = "Không tìm thấy cửa hàng." });

            store.StoreName = model.StoreName;
            store.Phone = model.Phone;
            store.StreetAddress = model.StreetAddress;
            store.Ward = model.Ward;
            store.District = model.District;
            store.City = model.City;
            store.Country = model.Country;
            store.Postcode = model.Postcode;
            store.Latitude = model.Latitude;
            store.Longitude = model.Longitude;
            store.GooglePlaceId = model.GooglePlaceId;
            store.Rating = model.Rating;
            store.DateJoined = model.DateJoined;  // người dùng nhập
            store.IsActive = model.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật cửa hàng thành công!", store });
        }

        // ✅ Xóa cửa hàng
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStore(int id)
        {
            var store = await _context.Stores.FindAsync(id);
            if (store == null)
                return NotFound(new { message = "Không tìm thấy cửa hàng." });

            _context.Stores.Remove(store);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa cửa hàng thành công!" });
        }
    }
}
