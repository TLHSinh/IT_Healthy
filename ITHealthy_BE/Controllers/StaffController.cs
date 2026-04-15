using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using ITHealthy.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ITHealthy.Controllers;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class StaffsController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public StaffsController(ITHealthyDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        // GET: api/staffs
       [HttpGet]
        public async Task<IActionResult> GetAllStaffs()
        {
            // Lấy danh sách nhân viên kèm thông tin cửa hàng
            var staffs = await _context.Staff
                .Include(s => s.Store)
                .Select(s => new
                {
                    s.StaffId,
                    s.FullName,
                    s.Email,
                    s.Phone,
                    s.RoleStaff,
                    s.IsActive,
                    s.Avatar,
                    s.Gender,
                    Dob = s.Dob,
                    HireDate = s.HireDate,
                    StoreId = s.StoreId,
                    StoreName = s.Store != null ? s.Store.StoreName : null
                })
                .ToListAsync();

            // Trả về trực tiếp mảng để dashboard cũ không lỗi
            return Ok(staffs);
        }






        // GET: api/staffs/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            var staff = await _context.Staff
                .Include(s => s.Store)
                .Where(s => s.StaffId == id)
                .Select(s => new
                {
                    s.StaffId,
                    s.FullName,
                    s.Email,
                    s.Phone,
                    s.RoleStaff,
                    s.IsActive,
                    s.Gender,
                    Dob = s.Dob,
                    HireDate = s.HireDate,
                    StoreId = s.StoreId,
                    StoreName = s.Store != null ? s.Store.StoreName : null,
                    Avatar = s.Avatar
                })
                .FirstOrDefaultAsync();

            if (staff == null)
                return NotFound(new { message = "Không tìm thấy nhân viên!" });

            return Ok(staff);
        }


        // POST: api/staffs
        // [HttpPost]
        // public async Task<ActionResult<Staff>> Create([FromForm] StaffRequestDTO staff)
        // {
        //     if (!ModelState.IsValid)
        //         return BadRequest(ModelState);

        //     var errors = new List<string>();

        //     if (await _context.Staff.AnyAsync(s => s.Email == staff.Email))
        //         errors.Add("Email đã tồn tại trong hệ thống.");

        //     if (await _context.Staff.AnyAsync(s => s.Phone == staff.Phone))
        //         errors.Add("Số điện thoại đã tồn tại trong hệ thống.");

        //     if (errors.Count > 0)
        //         return BadRequest(new { messages = errors });

        //     string? avatarUrl = null;
        //     if (staff.Avatar != null && staff.Avatar.Length > 0)
        //     {
        //         avatarUrl = await _cloudinaryService.UploadImageAsync(staff.Avatar);
        //     }

        //     staff.PasswordHash = AuthController.HashPassword(staff.PasswordHash);
        //     // staff.IsActive = true;

        //     var newStaff = new Staff
        //     {
        //         StoreId = staff.StoreId,
        //         FullName = staff.FullName,
        //         Phone = staff.Phone,
        //         Email = staff.Email,
        //         PasswordHash = staff.PasswordHash,
        //         Gender = staff.Gender,
        //         Dob = staff.Dob,
        //         Avatar = avatarUrl,
        //         RoleStaff = staff.RoleStaff,
        //         HireDate = staff.HireDate,
        //     };
                
        //         _context.Staff.Add(newStaff);
        //     await _context.SaveChangesAsync();
                
        //     var store = await _context.Stores.FindAsync(staff.StoreId);

        //     return Ok(new
        //     {
        //         message = "Tạo nhân viên thành công!",
        //         data = newStaff
        //     });
        // }
        [HttpPost]
        public async Task<ActionResult> Create([FromForm] StaffRequestDTO staff)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var errors = new List<string>();

            if (await _context.Staff.AnyAsync(s => s.Email == staff.Email))
                errors.Add("Email đã tồn tại trong hệ thống.");

            if (await _context.Staff.AnyAsync(s => s.Phone == staff.Phone))
                errors.Add("Số điện thoại đã tồn tại trong hệ thống.");

            if (errors.Count > 0)
                return BadRequest(new { messages = errors });

            string? avatarUrl = null;
            if (staff.Avatar != null && staff.Avatar.Length > 0)
            {
                avatarUrl = await _cloudinaryService.UploadImageAsync(staff.Avatar);
            }

            staff.PasswordHash = AuthController.HashPassword(staff.PasswordHash);

            var newStaff = new Staff
            {
                StoreId = staff.StoreId,
                FullName = staff.FullName,
                Phone = staff.Phone,
                Email = staff.Email,
                PasswordHash = staff.PasswordHash,
                Gender = staff.Gender,
                Dob = staff.Dob,
                Avatar = avatarUrl,
                RoleStaff = staff.RoleStaff,
                HireDate = staff.HireDate,
                IsActive = true // nếu muốn mặc định đang làm
            };

            _context.Staff.Add(newStaff);
            await _context.SaveChangesAsync();

            // Load thông tin cửa hàng
            var store = await _context.Stores.FindAsync(newStaff.StoreId);

            // Trả về object giống GetAllStaffs
            return Ok(new
            {
                message = "Tạo nhân viên thành công!",
                data = new
                {
                    newStaff.StaffId,
                    newStaff.FullName,
                    newStaff.Email,
                    newStaff.Phone,
                    newStaff.RoleStaff,
                    newStaff.IsActive,
                    newStaff.Avatar,
                    newStaff.Gender,
                    Dob = newStaff.Dob,
                    HireDate = newStaff.HireDate,
                    StoreId = newStaff.StoreId,
                    StoreName = store?.StoreName
                }
            });
        }

        // // PUT: api/staffs/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] StaffRequestDTO updatedStaff)
        {
            var staff = await _context.Staff.FindAsync(id);
            if (staff == null)
                return NotFound(new { message = "Không tìm thấy nhân viên!" });

            var errors = new List<string>();

            // 🔹 Kiểm tra trùng Email (trừ chính nhân viên đang update)
            if (await _context.Staff.AnyAsync(s => s.Email == updatedStaff.Email && s.StaffId != id))
                errors.Add("Email đã tồn tại trong hệ thống.");

            // 🔹 Kiểm tra trùng SĐT
            if (await _context.Staff.AnyAsync(s => s.Phone == updatedStaff.Phone && s.StaffId != id))
                errors.Add("Số điện thoại đã tồn tại trong hệ thống.");

            if (errors.Count > 0)
                return BadRequest(new { messages = errors });


            if (updatedStaff.Avatar != null && updatedStaff.Avatar.Length > 0)
            {
                var avatarUrl = await _cloudinaryService.UploadImageAsync(updatedStaff.Avatar);
                staff.Avatar = avatarUrl;
            }

            // 🔹 Cập nhật thông tin
            staff.StoreId = updatedStaff.StoreId;
            staff.FullName = updatedStaff.FullName;
            staff.Phone = updatedStaff.Phone;
            staff.Email = updatedStaff.Email;
            staff.Gender = updatedStaff.Gender;
            staff.Dob = updatedStaff.Dob;
            staff.RoleStaff = updatedStaff.RoleStaff;
            staff.HireDate = updatedStaff.HireDate;
            staff.Avatar = staff.Avatar;
            // staff.IsActive = updatedStaff.IsActive;

            // 🔹 Mã hoá lại mật khẩu nếu có thay đổi
            if (!string.IsNullOrEmpty(updatedStaff.PasswordHash) &&
                updatedStaff.PasswordHash != staff.PasswordHash)
            {
                staff.PasswordHash = AuthController.HashPassword(updatedStaff.PasswordHash);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật thông tin thành công!",
                data = staff
            });
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
    }
}
