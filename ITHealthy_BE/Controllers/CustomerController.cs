using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using ITHealthy.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ITHealthy.Controllers;


namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public CustomersController(ITHealthyDbContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        // GET: api/customers
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Customer>>> GetAllCustomers()
        {
            return await _context.Customers.ToListAsync();
        }

        // GET: api/customers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Customer>> GetByIdCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound();

            return customer;
        }

        // POST: api/customers
        [HttpPost]
        public async Task<ActionResult<Customer>> CreateCustomer([FromForm] CustomerRequestDTO request)
        {
            var errors = new List<string>();

            if (await _context.Customers.AnyAsync(c => c.Email == request.Email))
                errors.Add("Email đã tồn tại trong hệ thống.");

            if (await _context.Customers.AnyAsync(c => c.Phone == request.Phone))
                errors.Add("Số điện thoại đã tồn tại trong hệ thống.");

            if (errors.Count > 0)
                return BadRequest(new { messages = errors });

            string? avatarUrl = null;
            if (request.Avatar != null && request.Avatar.Length > 0)
            {
                avatarUrl = await _cloudinaryService.UploadImageAsync(request.Avatar);
            }

            var hashedPassword = AuthController.HashPassword(request.PasswordHash);

            var customer = new Customer
            {
                FullName = request.FullName,
                Phone = request.Phone,
                Email = request.Email,
                PasswordHash = hashedPassword,
                Gender = request.Gender,
                Dob = request.DOB,
                RoleUser = request.RoleUser,
                Avatar = avatarUrl,
                IsActive = request.IsActive,
                CreatedAt = DateTime.Now
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByIdCustomer), new { id = customer.CustomerId }, new
            {
                message = "Tạo tài khoản khách hàng thành công!",
                customer
            });
        }

        // PUT: api/customers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] CustomerRequestDTO request)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound(new { message = "Không tìm thấy khách hàng!" });

            var errors = new List<string>();

            if (await _context.Customers.AnyAsync(c => c.Email == request.Email && c.CustomerId != id))
                errors.Add("Email đã tồn tại trong hệ thống.");

            if (await _context.Customers.AnyAsync(c => c.Phone == request.Phone && c.CustomerId != id))
                errors.Add("Số điện thoại đã tồn tại trong hệ thống.");

            if (errors.Count > 0)
                return BadRequest(new { messages = errors });

            if (request.Avatar != null && request.Avatar.Length > 0)
            {
                var avatarUrl = await _cloudinaryService.UploadImageAsync(request.Avatar);
                customer.Avatar = avatarUrl;
            }

            customer.FullName = request.FullName;
            customer.Phone = request.Phone;
            customer.Email = request.Email;
            customer.Gender = request.Gender;
            customer.Dob = request.DOB;
            customer.RoleUser = request.RoleUser;
            customer.IsActive = request.IsActive;


            if (!string.IsNullOrEmpty(request.PasswordHash) &&
                request.PasswordHash != customer.PasswordHash)
            {
                customer.PasswordHash = AuthController.HashPassword(request.PasswordHash);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật thông tin khách hàng thành công!",
                data = customer
            });
        }

        // DELETE: api/customers/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound();

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa khách hàng thành công!" });
        }
    }
}
