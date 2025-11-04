namespace ITHealthy.DTOs
{
    public class ProductRequetsDTO
    {
        public int? CategoryId { get; set; }

        public string ProductName { get; set; } = null!;
        public string? DescriptionProduct { get; set; }

        public decimal? BasePrice { get; set; }
        public decimal? Calories { get; set; }
        public decimal? Protein { get; set; }
        public decimal? Carbs { get; set; }
        public decimal? Fat { get; set; }

        public bool? IsAvailable { get; set; }

        // Ảnh upload từ form
        public IFormFile? ImageProduct { get; set; }
    }
}
