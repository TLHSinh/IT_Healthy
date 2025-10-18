namespace ITHealthy.DTOs
{
    public class VerifyOtpDTO
    {
        public int CustomerId { get; set; }
        public string Otp { get; set; }
        public string Email { get; set; }
    }
}
