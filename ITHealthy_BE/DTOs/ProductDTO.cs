namespace ITHealthy.DTOs
{
    public class ProductDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public decimal? BasePrice { get; set; }
        public bool? IsAvailable { get; set; }
        public string? DescriptionProduct { get; set; }
        public string? ImageProduct { get; set; }
        public string? CategoryName { get; set; }
    }
}
