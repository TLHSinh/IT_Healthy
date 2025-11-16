public class PromotionCreateRequest
{
    public string PromotionName { get; set; } = string.Empty;
    public string? DescriptionPromotion { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string DiscountType { get; set; } = "Percent";
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; } = 0;

    public List<int>? StoreIDs { get; set; }
    public List<int>? ProductIDs { get; set; }
    public List<int>? CategoryIDs { get; set; }
}
