public class CheckoutRequest
{
    public int? CustomerId { get; set; }
    public int? StoreId { get; set; }
    public int? VoucherId { get; set; }
    public int? PromotionId { get; set; }
    public decimal? Discount { get; set; }
    public required List<CheckoutItem> Items { get; set; }
}