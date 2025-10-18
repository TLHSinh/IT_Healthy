using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class Voucher
{
    public int VoucherId { get; set; }

    public string Code { get; set; } = null!;

    public string? DescriptionVou { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? ExpiryDate { get; set; }

    public string DiscountType { get; set; } = null!;

    public decimal? DiscountValue { get; set; }

    public decimal? MinOrderAmount { get; set; }

    public decimal? MaxDiscountAmount { get; set; }

    public int? MaxUsage { get; set; }

    public int? UsedCount { get; set; }

    public int? PerCustomerLimit { get; set; }

    public bool? IsActive { get; set; }

    public bool? IsStackable { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<VoucherCategory> VoucherCategories { get; set; } = new List<VoucherCategory>();

    public virtual ICollection<VoucherProduct> VoucherProducts { get; set; } = new List<VoucherProduct>();

    public virtual ICollection<VoucherRedemption> VoucherRedemptions { get; set; } = new List<VoucherRedemption>();

    public virtual ICollection<VoucherStore> VoucherStores { get; set; } = new List<VoucherStore>();
}
