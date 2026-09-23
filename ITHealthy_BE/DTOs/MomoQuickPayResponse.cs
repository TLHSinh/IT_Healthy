public class MomoQuickPayResponse
{
    public int resultCode { get; set; }
    public string message { get; set; } = string.Empty;
    public string payUrl { get; set; } = string.Empty;      // URL thanh toán web
    public string deeplink { get; set; } = string.Empty;    // app MoMo
    public string orderId { get; set; } = string.Empty;
    public string requestId { get; set; } = string.Empty;
    public string signature { get; set; } = string.Empty;
}
