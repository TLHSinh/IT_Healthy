using ITHealthy.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace ITHealthy.Services
{
    public class TokenService : UserTokenService, AdminTokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private string GetSigningKey()
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            return jwtSettings["SecretKey"] ?? jwtSettings["Key"]
                ?? throw new InvalidOperationException("JwtSettings.SecretKey (hoặc JwtSettings.Key) chưa được cấu hình.");
        }

        private static string NormalizeRole(string? role, string defaultRole)
        {
            if (string.IsNullOrWhiteSpace(role))
                return defaultRole;

            return string.Equals(role.Trim(), defaultRole, StringComparison.OrdinalIgnoreCase)
                ? defaultRole
                : role.Trim();
        }

        // ✅ Access Token cho Customer (User)
        public string CreateAccessTokenUser(Customer user, IList<string> roles)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(GetSigningKey()));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.CustomerId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.FullName ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.CustomerId.ToString()),
                new Claim(ClaimTypes.MobilePhone, user.Phone ?? "")
            };

            if (!string.IsNullOrEmpty(user.Email))
                claims.Add(new Claim(ClaimTypes.Email, user.Email));

            // Thêm role cho user
            if (!string.IsNullOrEmpty(user.RoleUser))
                claims.Add(new Claim(ClaimTypes.Role, NormalizeRole(user.RoleUser, "User")));
            else
                claims.Add(new Claim(ClaimTypes.Role, "User"));

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["AccessTokenExpirationMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ✅ Access Token cho Staff (Admin)
        public string CreateAccessTokenAdmin(Staff staff, IList<string> roles)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(GetSigningKey()));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, staff.StaffId.ToString()),
                new Claim(JwtRegisteredClaimNames.UniqueName, staff.FullName ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, staff.StaffId.ToString()),
                new Claim(ClaimTypes.MobilePhone, staff.Phone ?? "")
            };

            if (!string.IsNullOrEmpty(staff.Email))
                claims.Add(new Claim(ClaimTypes.Email, staff.Email));

            // Thêm role cho admin
            if (!string.IsNullOrEmpty(staff.RoleStaff))
                claims.Add(new Claim(ClaimTypes.Role, NormalizeRole(staff.RoleStaff, "Admin")));
            else
                claims.Add(new Claim(ClaimTypes.Role, "Admin"));

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["AccessTokenExpirationMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ✅ Refresh token dùng chung cho cả User và Admin
        public RefreshToken CreateRefreshToken(string ipAddress)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);

            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomBytes),
                Expires = DateTime.UtcNow.AddDays(double.Parse(jwtSettings["RefreshTokenExpirationDays"]!)),
                Created = DateTime.UtcNow,
                CreatedById = ipAddress
            };
        }
    }
}
