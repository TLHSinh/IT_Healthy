public class MomoQuickPayResponse
{
    public int resultCode { get; set; }
    public string message { get; set; }
    public string payUrl { get; set; }      // URL thanh toán web
    public string deeplink { get; set; }    // app MoMo
    public string orderId { get; set; }
    public string requestId { get; set; }
    public string signature { get; set; }
}
