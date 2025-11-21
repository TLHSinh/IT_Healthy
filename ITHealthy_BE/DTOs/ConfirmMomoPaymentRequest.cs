namespace ITHealthy.DTOs
{
    public class ConfirmMomoPaymentRequest
    {
        public int OrderId { get; set; }
        public int ResultCode { get; set; }  // 0 = success, other = failed
    }
}
