using System;
using Microsoft.AspNetCore.Http;

namespace ITHealthy.DTOs
{
    public class CustomerRequestDTO
    {
        public required string FullName { get; set; }
        public required string Phone { get; set; }
        public string? Email { get; set; }
        public required string PasswordHash { get; set; }
        public string? Gender { get; set; }
        public DateOnly? DOB { get; set; }
        public string? RoleUser { get; set; }
        public bool IsActive { get; set; } = false;

        // File upload
        public IFormFile? Avatar { get; set; }
    }

}