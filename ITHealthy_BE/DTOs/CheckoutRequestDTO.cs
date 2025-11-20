public class CheckoutRequest
{
    public int CustomerId { get; set; }
    public int StoreId { get; set; }

    public int? VoucherId { get; set; }
    public int? PromotionId { get; set; }

    public decimal? Discount { get; set; } // giảm giá tổng

    public string? OrderNote { get; set; } // ghi chú đơn hàng
    public string? OrderType { get; set; } // "Shipping" hoặc "Pickup"

    // Thông tin giao hàng (nếu OrderType = Shipping)
    public int? ShippingAddressId { get; set; }
    public string? CourierName { get; set; }
    public DateTime? ShipDate { get; set; }
    public string? ShipTime { get; set; }
    public decimal? ShippingCost { get; set; }
    public string? PaymentMethod { get; set; }

    public List<CheckoutItem> Items { get; set; } = new List<CheckoutItem>();
}
