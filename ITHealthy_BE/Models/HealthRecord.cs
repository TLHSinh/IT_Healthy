using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHealthy.Models
{
    public partial class HealthRecord
    {
        public int HealthRecordId { get; set; }

        public int CustomerId { get; set; }

        public string Gender { get; set; } = null!;

        public int Age { get; set; }

        public double Height { get; set; }

        public double Weight { get; set; }

        public double Activity { get; set; }

        public double Bmi { get; set; }

        public double Bmr { get; set; }

        public double Tdee { get; set; }

        public string? Note { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation
        [ForeignKey("CustomerId")]
public virtual Customer? Customer { get; set; }
    }
}