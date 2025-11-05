using System;
using Microsoft.AspNetCore.Http;

namespace ITHealthy.DTOs
{
    public class StaffRequestDTO
    {
        public required int StaffId { get; set; }

        public required int? StoreId { get; set; }

        public required string FullName { get; set; } = null!;

        public required string? Phone { get; set; }

        public string? Email { get; set; }

        public required string PasswordHash { get; set; } = null!;

        public string? Gender { get; set; }

        public DateOnly? Dob { get; set; }

        public string? RoleStaff { get; set; }

        public DateOnly? HireDate { get; set; }

        public IFormFile? Avatar { get; set; }

    }
}