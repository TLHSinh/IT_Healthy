namespace ITHealthy.DTOs
{

    public class IngredientDTO
    {
        public int IngredientId { get; set; }

        public string IngredientName { get; set; } = null!;

        public int? CategoriesIngredientsId { get; set; }
        public string? CategoryName { get; set; }

        public string Unit { get; set; } = null!;

        public decimal BasePrice { get; set; }

        public decimal? Calories { get; set; }

        public decimal? Protein { get; set; }

        public decimal? Carbs { get; set; }

        public decimal? Fat { get; set; }

        public string? ImageIngredients { get; set; }

        public DateTime? CreatedAt { get; set; }

        public bool? IsAvailable { get; set; }
    }
}