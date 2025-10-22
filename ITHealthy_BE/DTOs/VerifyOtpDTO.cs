namespace ITHealthy.DTOs
{
    public class VerifyOtpDTO
    {
        public int CustomerId { get; set; }
        public required string Otp { get; set; }
        public required string Email { get; set; }
    }
}
