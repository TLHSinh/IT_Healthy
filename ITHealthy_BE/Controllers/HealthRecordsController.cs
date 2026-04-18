using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthRecordsController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public HealthRecordsController(ITHealthyDbContext context)
        {
            _context = context;
        }

        // ✅ Lấy lịch sử sức khỏe của user
        [HttpGet("user/{customerId}")]
        public async Task<ActionResult<IEnumerable<HealthRecordDTO>>> GetByCustomer(int customerId)
        {
            var records = await _context.HealthRecords
                .Where(x => x.CustomerId == customerId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new HealthRecordDTO
                {
                    HealthRecordId = x.HealthRecordId,
                    Bmi = x.Bmi,
                    Bmr = x.Bmr,
                    Tdee = x.Tdee,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();

            return Ok(records);
        }

        // ✅ Lấy chi tiết 1 record
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var record = await _context.HealthRecords.FindAsync(id);

            if (record == null)
                return NotFound(new { message = "Không tìm thấy dữ liệu." });

            return Ok(record);
        }

        // ✅ Thêm record
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] HealthRecord model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            model.CreatedAt = DateTime.Now;

            _context.HealthRecords.Add(model);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Lưu tình trạng sức khỏe thành công!",
                data = model
            });
        }

        // ✅ Xóa record
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var record = await _context.HealthRecords.FindAsync(id);

            if (record == null)
                return NotFound(new { message = "Không tìm thấy dữ liệu." });

            _context.HealthRecords.Remove(record);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa thành công!" });
        }
    }
}