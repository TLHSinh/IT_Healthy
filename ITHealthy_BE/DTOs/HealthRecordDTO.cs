namespace ITHealthy.DTOs
{
    public class HealthRecordDTO
    {
        public int HealthRecordId { get; set; }

        public double Bmi { get; set; }

        public double Bmr { get; set; }

        public double Tdee { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}