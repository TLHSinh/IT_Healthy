namespace ITHealthy.DTOs
{
    public class MomoIpnRequest
    {
        // Core fields that MoMo always sends
        public string partnerCode { get; set; } = string.Empty;
        public string orderId { get; set; } = string.Empty;
        public string requestId { get; set; } = string.Empty;
        public long amount { get; set; }
        public int resultCode { get; set; }
        public string message { get; set; } = string.Empty;
        public string extraData { get; set; } = string.Empty;
        public string signature { get; set; } = string.Empty;

        // Optional fields - MoMo may or may not send these
        public string? ipnUrl { get; set; }
        public string? orderInfo { get; set; }
        public string? payType { get; set; }
        public string? redirectUrl { get; set; }
        public string? requestType { get; set; }

        public string? responseTime { get; set; }
        public string? transId { get; set; }
        public string? orderType { get; set; }
    }
}
