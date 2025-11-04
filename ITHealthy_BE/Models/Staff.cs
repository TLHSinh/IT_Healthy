using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHealthy.Models
{
    public partial class Staff
    {
        public int StaffId { get; set; }

        public int? StoreId { get; set; }

        public string FullName { get; set; } = null!;

        public string? Phone { get; set; }

        public string? Email { get; set; }

        public string PasswordHash { get; set; } = null!;

        public string? Gender { get; set; }

        public DateOnly? Dob { get; set; }

        public string? Avatar { get; set; }

        public string? RoleStaff { get; set; }

        public DateOnly? HireDate { get; set; }

        public bool? IsActive { get; set; }

        public virtual Store? Store { get; set; }



        // ✅ Thuộc tính không ánh xạ sang DB — chỉ dùng để hiển thị StoreName khi lấy danh sách nhân viên
        [NotMapped]
        public string? StoreName => Store != null ? Store.StoreName : null;
    }
}