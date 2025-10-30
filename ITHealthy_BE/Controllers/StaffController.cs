using ITHealthy.Data;
using ITHealthy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffsController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public StaffsController(ITHealthyDbContext context)
        {
            _context = context;
        }

        // GET: api/staffs
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var staffs = await _context.Staff.ToListAsync();
            return Ok(staffs);
        }

        // GET: api/staffs/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var staff = await _context.Staff.FindAsync(id);
            if (staff == null)
                return NotFound(new { message = "Không tìm thấy nhân viên!" });

            return Ok(staff);
        }

        // POST: api/staff
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Staff staff)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            staff.IsActive = true;

            _context.Staff.Add(staff);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo nhân viên thành công!", data = staff });
        }

        // PUT: api/staffs/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Staff updatedStaff)
        {
            var staff = await _context.Staff.FindAsync(id);
            if (staff == null)
                return NotFound(new { message = "Không tìm thấy nhân viên!" });

            staff.StoreId = updatedStaff.StoreId;
            staff.FullName = updatedStaff.FullName;
            staff.Phone = updatedStaff.Phone;
            staff.Email = updatedStaff.Email;
            staff.Gender = updatedStaff.Gender;
            staff.Dob = updatedStaff.Dob;
            staff.RoleStaff = updatedStaff.RoleStaff;
            staff.PasswordHash = updatedStaff.PasswordHash;
            staff.IsActive = updatedStaff.IsActive;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thông tin thành công!", data = staff });
        }

        // DELETE: api/staffs/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var staff = await _context.Staff.FindAsync(id);
            if (staff == null)
                return NotFound(new { message = "Không tìm thấy nhân viên!" });

            _context.Staff.Remove(staff);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa nhân viên thành công!" });
        }

        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin()
        {
            // Kiểm tra nếu admin đã tồn tại
            var existAdmin = await _context.Staff.FirstOrDefaultAsync(s => s.Email == "admin@example.com");
            if (existAdmin != null)
            {
                return BadRequest(new { message = "Admin đã tồn tại!" });
            }

            var admin = new Staff
            {
                StoreId = 1,
                FullName = "Quản trị viên",
                Phone = "0909000000",
                Email = "admin@example.com",
                Gender = "Khác",
                Dob = new DateOnly(1990, 1, 1),
                RoleStaff = "Admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                IsActive = true
            };

            _context.Staff.Add(admin);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tạo tài khoản Admin thành công!", data = admin });
        }
    }
}
