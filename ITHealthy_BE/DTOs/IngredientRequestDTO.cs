namespace ITHealthy.DTOs
{
    public class IngredientRequestDTO
    {
        public required string IngredientName { get; set; }
        public required string Unit { get; set; }
        public required decimal BasePrice { get; set; }
        public decimal? Calories { get; set; }
        public decimal? Protein { get; set; }
        public decimal? Carbs { get; set; }
        public decimal? Fat { get; set; }
        public IFormFile? ImageIngredients { get; set; }
        public bool? IsAvailable { get; set; }
    }
}