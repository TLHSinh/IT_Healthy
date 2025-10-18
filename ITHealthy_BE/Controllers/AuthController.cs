using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using ITHealthy.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;



namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;

        public AuthController(ITHealthyDbContext context, ITokenService tokenService, IEmailService emailService)
        {
            _context = context;
            _tokenService = tokenService;
            _emailService = emailService; // 16/10 11h làm tới bước này
        }

        // API Gửi OTP
        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] string email)
        {
            var user = await _context.Customers.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                return NotFound(new { Message = "Người dùng không tồn tại" });

            var otpCode = new Random().Next(100000, 999999).ToString();
            var expiry = DateTime.UtcNow.AddMinutes(5);

            var userOtp = new UserOtp
            {
                CustomerId = user.CustomerId,
                Otpcode = otpCode,
                ExpiryTime = expiry,
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.UserOtps.Add(userOtp);
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(user.Email, "Mã OTP xác thực", $"Mã OTP của bạn là: {otpCode}");

            return Ok(new { Message = "OTP đã được gửi tới email của bạn" });
        }


        //API Xác thực OTP
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDTO dto)
        {
            var otp = await _context.UserOtps
                .Where(x => x.Customer.Email == dto.Email && x.Otpcode == dto.Otp)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null)
                return BadRequest(new { Message = "OTP không hợp lệ" });

            if (otp.IsUsed == true)
                return BadRequest(new { Message = "OTP đã được sử dụng" });

            if (otp.ExpiryTime < DateTime.UtcNow)
                return BadRequest(new { Message = "OTP đã hết hạn" });

            otp.IsUsed = true;

            // Xác minh đăng ký
            var user = await _context.Customers.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null) return NotFound();
            user.IsActive = true;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Xác thực OTP thành công!" });
        }


        //  Register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            if (await _context.Customers.AnyAsync(x => x.Email == dto.Email))
                return BadRequest(new { Message = "Email đã tồn tại" });
            if (await _context.Customers.AnyAsync(x => x.Phone == dto.Phone))
                return BadRequest(new { Message = "Phone đã tồn tại" });

            var passwordHash = HashPassword(dto.Password);

            var user = new Customer
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = passwordHash,
                Phone = dto.Phone,
                CreatedAt = DateTime.Now,
                RoleUser = "User",
                IsActive = false
            };

            _context.Customers.Add(user);
            await _context.SaveChangesAsync();

            // Gửi OTP xác minh email
            await SendOtpAsync(user.CustomerId);

            return Ok(new { Message = "Đăng ký người dùng thành công" });
        }

        //  Login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            var user = await _context.Customers
                .Include(u => u.RefreshTokens)
                .SingleOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || !VerifyPassword(dto.Password, user.PasswordHash))
                return Unauthorized(new { Message = "Email hoặc Mật Khẩu không đúng" });

            if ((bool)!user.IsActive)
            {
                // Gửi OTP lại cho người dùng
                await SendOtp(dto.Email);
                return BadRequest(new { Message = "Tài khoản chưa xác thực. Vui lòng kiểm tra email để nhận OTP." });
            }

            var accessToken = _tokenService.CreateAccessToken(user, new List<string> { "User" });
            var refreshToken = _tokenService.CreateRefreshToken(GetIpAddress());
            user.RefreshTokens.Add(refreshToken);

            await _context.SaveChangesAsync();

            return Ok(new TokenResponsedDTO(accessToken, refreshToken.Token));
        }

     


        //  HÀM HỖ TRỢ: gửi OTP
        private async Task SendOtpAsync(int customerId)
        {
            var user = await _context.Customers.FindAsync(customerId);
            if (user == null || string.IsNullOrEmpty(user.Email))
                throw new Exception("Không tìm thấy người dùng hoặc email rỗng");

            var otpCode = new Random().Next(100000, 999999).ToString();

            var userOtp = new UserOtp
            {
                CustomerId = customerId,
                Otpcode = otpCode,
                ExpiryTime = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.UserOtps.Add(userOtp);
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                user.Email!,
                "Mã OTP xác thực ITHealthy",
                $"Xin chào {user.FullName},\n\nMã OTP của bạn là: {otpCode}\nMã sẽ hết hạn sau 5 phút.\n\nITHealthy Team"
            );
        }

        //  Refresh token
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] TokenRequestDTO dto)
        {
            var refreshToken = dto.RefreshToken;
            var user = await _context.Customers
                .Include(u => u.RefreshTokens)
                .SingleOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == refreshToken));

            if (user == null)
                return Unauthorized(new { Message = "Invalid refresh token" });

            var existingToken = user.RefreshTokens.Single(x => x.Token == refreshToken);

            if (!existingToken.isActive)
                return Unauthorized(new { Message = "Refresh token is inactive" });

            existingToken.Revoked = DateTime.UtcNow;
            existingToken.RevokedById = GetIpAddress();

            var newRefreshToken = _tokenService.CreateRefreshToken(GetIpAddress());
            existingToken.ReplacedByToken = newRefreshToken.Token;
            user.RefreshTokens.Add(newRefreshToken);

            await _context.SaveChangesAsync();

            var newAccessToken = _tokenService.CreateAccessToken(user, new List<string> { "User" });

            return Ok(new TokenResponsedDTO(newAccessToken, newRefreshToken.Token));
        }

        // ✅ Revoke
        [HttpPost("revoke")]
        public async Task<IActionResult> Revoke([FromBody] TokenRequestDTO dto)
        {
            var token = dto.RefreshToken;
            var user = await _context.Customers
                .Include(u => u.RefreshTokens)
                .SingleOrDefaultAsync(u => u.RefreshTokens.Any(t => t.Token == token));

            if (user == null)
                return NotFound();

            var existing = user.RefreshTokens.Single(x => x.Token == token);

            if (!existing.isActive)
                return BadRequest(new { Message = "Token already revoked" });

            existing.Revoked = DateTime.UtcNow;
            existing.RevokedById = GetIpAddress();

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Token revoked successfully" });
        }

        // ✅ Hash password (PBKDF2)
        private string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        private string GetIpAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"]!;
            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }
    }
}
