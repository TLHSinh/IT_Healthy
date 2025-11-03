using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

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

    public string? RoleStaff { get; set; }

    public DateOnly? HireDate { get; set; }

    public bool? IsActive { get; set; }

    public virtual Store? Store { get; set; }

}
