public class RedeemVoucherRequest
{
    public int VoucherId { get; set; }
    public int CustomerId { get; set; }
    public int OrderId { get; set; }  // optional: để tracking đơn hàng nào dùng
    public decimal? Amount { get; set; }
}