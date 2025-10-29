using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
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
        public async Task<ActionResult<Customer>> Create([FromForm] CustomerRequestDTO request)
        {
            string? avatarUrl = null;

            if (request.AvatarFile != null && request.AvatarFile.Length > 0)
            {
                avatarUrl = await _cloudinaryService.UploadImageAsync(request.AvatarFile);
            }

            var customer = new Customer
            {
                FullName = request.FullName,
                Phone = request.Phone,
                Email = request.Email,
                PasswordHash = request.PasswordHash,
                Gender = request.Gender,
                Dob = request.DOB,
                RoleUser = request.RoleUser,
                Avatar = avatarUrl,
                IsActive = request.IsActive,
                CreatedAt = DateTime.Now
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByIdCustomer), new { id = customer.CustomerId }, customer);
        }


        // PUT: api/customers/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] CustomerRequestDTO request)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return NotFound();

            // Upload ảnh mới nếu có
            if (request.AvatarFile != null && request.AvatarFile.Length > 0)
            {
                var avatarUrl = await _cloudinaryService.UploadImageAsync(request.AvatarFile);
                customer.Avatar = avatarUrl;
            }

            // Cập nhật các trường
            customer.FullName = request.FullName;
            customer.Phone = request.Phone;
            customer.Email = request.Email;
            customer.PasswordHash = request.PasswordHash ?? customer.PasswordHash;
            customer.Gender = request.Gender;
            customer.Dob = request.DOB;
            customer.RoleUser = request.RoleUser;
            customer.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return Ok(customer);
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

            return NoContent();
        }
    }
}
