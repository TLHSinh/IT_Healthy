public class ValidateVoucherResponse
{
    public bool Valid { get; set; }
    public required string Message { get; set; }
    public int? VoucherId { get; set; }
    public decimal DiscountAmount { get; set; }
}
