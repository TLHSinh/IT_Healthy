using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHealthy.Models
{
    public partial class Staff
    {
        [Key]
        public int StaffId { get; set; }

        // 🔗 Liên kết đến bảng Store (có thể null nếu nhân viên chưa thuộc cửa hàng nào)
        [ForeignKey("Store")]
        public int? StoreId { get; set; }

        [Required(ErrorMessage = "Tên nhân viên không được để trống")]
        [MaxLength(100)]
        public string FullName { get; set; } = null!;

        [Phone]
        public string? Phone { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống")]
        public string PasswordHash { get; set; } = null!;

        [MaxLength(10)]
        public string? Gender { get; set; }

        public DateOnly? Dob { get; set; }

        [MaxLength(50)]
        public string? RoleStaff { get; set; }

        public DateOnly? HireDate { get; set; }

        public bool? IsActive { get; set; }

        // ✅ Thuộc tính điều hướng
        public virtual Store? Store { get; set; }

        // ✅ Thuộc tính không ánh xạ sang DB — chỉ dùng để hiển thị StoreName khi lấy danh sách nhân viên
        [NotMapped]
        public string? StoreName => Store != null ? Store.StoreName : null;
    }
}
