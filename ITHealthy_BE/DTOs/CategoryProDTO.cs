namespace ITHealthy.DTOs
{
    public class CategoryProDTO
    {
        public int CategoryId { get; set; }

        public string CategoryName { get; set; } = null!;

        public string? DescriptionCat { get; set; }

        public string? ImageCategories { get; set; }

    }
}