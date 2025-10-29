using System;
using Microsoft.AspNetCore.Http;

namespace ITHealthy.DTOs
{
    public class CustomerCreateRequestDTO
    {
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string? Email { get; set; }
        public string PasswordHash { get; set; }
        public string? Gender { get; set; }
        public DateOnly? DOB { get; set; }
        public string? RoleUser { get; set; }
        public bool IsActive { get; set; } = false;

        // File upload
        public IFormFile? AvatarFile { get; set; }
    }
}
