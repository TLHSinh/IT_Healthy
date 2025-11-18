public class ValidateVoucherRequest
{
    public required string Code { get; set; }
    public int CustomerId { get; set; }
    public decimal OrderTotal { get; set; }
    public decimal ShippingFee { get; set; }

}
