namespace ITHealthy.DTOs
{
    public class MomoIpnRequest
    {
        public required string PartnerCode { get; set; }
        public required string OrderId { get; set; }
        public required string RequestId { get; set; }
        public long Amount { get; set; }
        public int ResultCode { get; set; }
        public required string Message { get; set; }
        public required string ExtraData { get; set; }
        public required string Signature { get; set; }
        public string ipnUrl { get; set; } = "";
        public string orderInfo { get; set; } = "";
        public string redirectUrl { get; set; } = "";
        public string requestType { get; set; } = "";
        
        // Thêm các trường cần thiết cho IPN
        public string ResponseTime { get; set; } = "";
        public string TransId { get; set; } = "";
        public string OrderType { get; set; } = "";


    }
}