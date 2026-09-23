public class MomoQuickPayRequest
{
    public string partnerCode { get; set; } = string.Empty;
    public string partnerName { get; set; } = string.Empty;
    public string storeId { get; set; } = string.Empty;
    public string requestId { get; set; } = string.Empty;
    public string orderId { get; set; } = string.Empty;
    public long amount { get; set; }
    public string orderInfo { get; set; } = string.Empty;
    public string redirectUrl { get; set; } = string.Empty;
    public string ipnUrl { get; set; } = string.Empty;
    public string lang { get; set; } = string.Empty;
    public bool autoCapture { get; set; }
    public string extraData { get; set; } = string.Empty;
    public string orderGroupId { get; set; } = string.Empty;
    public string paymentCode { get; set; } = string.Empty;
    public string requestType { get; set; } = string.Empty;

    public string signature { get; set; } = string.Empty;


}
