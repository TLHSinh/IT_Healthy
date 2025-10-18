using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public int? CustomerId { get; set; }

    public int? StoreId { get; set; }

    public int? VoucherId { get; set; }

    public int? PromotionId { get; set; }

    public DateTime? OrderDate { get; set; }

    public decimal? TotalPrice { get; set; }

    public decimal? DiscountApplied { get; set; }

    public decimal? FinalPrice { get; set; }

    public string? StatusOrder { get; set; }

    public bool? InventoryDeducted { get; set; }

    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();

    public virtual Customer? Customer { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual Promotion? Promotion { get; set; }

    public virtual ICollection<ShippingDetail> ShippingDetails { get; set; } = new List<ShippingDetail>();

    public virtual Store? Store { get; set; }

    public virtual Voucher? Voucher { get; set; }

    public virtual ICollection<VoucherRedemption> VoucherRedemptions { get; set; } = new List<VoucherRedemption>();
}
