using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerAddressesController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public CustomerAddressesController(ITHealthyDbContext context)
        {
            _context = context;
        }

        // 🔹 GET: api/customeraddresses/all
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<CustomerAddressDTO>>> GetAllAddresses()
        {
            var addresses = await _context.CustomerAddresses
                .Include(a => a.Customer)
                .Select(a => new CustomerAddressDTO
                {
                    AddressId = a.AddressId,
                    CustomerId = a.CustomerId,
                    ReceiverName = a.ReceiverName,
                    PhoneNumber = a.PhoneNumber,
                    StreetAddress = a.StreetAddress,
                    Ward = a.Ward,
                    District = a.District,
                    City = a.City,
                    Country = a.Country,
                    Postcode = a.Postcode,
                    Latitude = a.Latitude,
                    Longitude = a.Longitude,
                    GooglePlaceId = a.GooglePlaceId,
                    AddressType = a.AddressType,
                    IsDefault = a.IsDefault,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    CustomerName = a.Customer.FullName
                })
                .ToListAsync();

            return Ok(addresses);
        }

        // 🔹 GET: api/customeraddresses/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CustomerAddressDTO>> GetAddressById(int id)
        {
            var address = await _context.CustomerAddresses
                .Include(a => a.Customer)
                .Where(a => a.AddressId == id)
                .Select(a => new CustomerAddressDTO
                {
                    AddressId = a.AddressId,
                    CustomerId = a.CustomerId,
                    ReceiverName = a.ReceiverName,
                    PhoneNumber = a.PhoneNumber,
                    StreetAddress = a.StreetAddress,
                    Ward = a.Ward,
                    District = a.District,
                    City = a.City,
                    Country = a.Country,
                    Postcode = a.Postcode,
                    Latitude = a.Latitude,
                    Longitude = a.Longitude,
                    GooglePlaceId = a.GooglePlaceId,
                    AddressType = a.AddressType,
                    IsDefault = a.IsDefault,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt,
                    CustomerName = a.Customer.FullName
                })
                .FirstOrDefaultAsync();

            if (address == null)
                return NotFound(new { message = "Không tìm thấy địa chỉ." });

            return Ok(address);
        }

        // 🔹 GET: api/customeraddresses/by-customer/{customerId}
        [HttpGet("by-customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<CustomerAddressDTO>>> GetAddressesByCustomer(int customerId)
        {
            var addresses = await _context.CustomerAddresses
                .Where(a => a.CustomerId == customerId)
                .Select(a => new CustomerAddressDTO
                {
                    AddressId = a.AddressId,
                    CustomerId = a.CustomerId,
                    ReceiverName = a.ReceiverName,
                    PhoneNumber = a.PhoneNumber,
                    StreetAddress = a.StreetAddress,
                    Ward = a.Ward,
                    District = a.District,
                    City = a.City,
                    Country = a.Country,
                    Postcode = a.Postcode,
                    AddressType = a.AddressType,
                    IsDefault = a.IsDefault
                })
                .ToListAsync();

            if (!addresses.Any())
                return NotFound(new { message = "Khách hàng này chưa có địa chỉ." });

            return Ok(addresses);
        }

        // 🔹 POST: api/customeraddresses/add
        [HttpPost("add")]
        public async Task<IActionResult> AddAddress([FromBody] CustomerAddressDTO request)
        {
            if (string.IsNullOrEmpty(request.ReceiverName) || string.IsNullOrEmpty(request.PhoneNumber))
                return BadRequest(new { message = "Tên người nhận và số điện thoại là bắt buộc." });

            var address = new CustomerAddress
            {
                CustomerId = request.CustomerId,
                ReceiverName = request.ReceiverName,
                PhoneNumber = request.PhoneNumber,
                StreetAddress = request.StreetAddress,
                Ward = request.Ward,
                District = request.District,
                City = request.City,
                Country = request.Country,
                Postcode = request.Postcode,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                GooglePlaceId = request.GooglePlaceId,
                AddressType = request.AddressType,
                IsDefault = request.IsDefault ?? false,
                CreatedAt = DateTime.Now
            };

            _context.CustomerAddresses.Add(address);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Thêm địa chỉ thành công!",
                data = new { address }
            });
        }

        // 🔹 PUT: api/customeraddresses/update/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] CustomerAddressDTO request)
        {
            var address = await _context.CustomerAddresses.FindAsync(id);
            if (address == null)
                return NotFound(new { message = "Không tìm thấy địa chỉ." });

            address.ReceiverName = request.ReceiverName;
            address.PhoneNumber = request.PhoneNumber;
            address.StreetAddress = request.StreetAddress;
            address.Ward = request.Ward;
            address.District = request.District;
            address.City = request.City;
            address.Country = request.Country;
            address.Postcode = request.Postcode;
            address.Latitude = request.Latitude;
            address.Longitude = request.Longitude;
            address.GooglePlaceId = request.GooglePlaceId;
            address.AddressType = request.AddressType;
            address.IsDefault = request.IsDefault;
            address.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật địa chỉ thành công!",
                data = new { address.AddressId, address.ReceiverName }
            });
        }

        // 🔹 DELETE: api/customeraddresses/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var address = await _context.CustomerAddresses.FindAsync(id);
            if (address == null)
                return NotFound(new { message = "Không tìm thấy địa chỉ." });

            _context.CustomerAddresses.Remove(address);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa địa chỉ thành công!" });
        }
    }
}
