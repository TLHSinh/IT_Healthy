using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class CategoriesIngredient
{
    public int CategoriesIngredientsId { get; set; }

    public string CategoryName { get; set; } = null!;

    public string? DescriptionCat { get; set; }

    public string? ImageCategories { get; set; }

    public virtual ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
}
