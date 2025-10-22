using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class Ingredient
{
    public int IngredientId { get; set; }

    public string IngredientName { get; set; } = null!;

    public int? CategoriesIngredientsId { get; set; }

    public string Unit { get; set; } = null!;

    public decimal BasePrice { get; set; }

    public decimal? Calories { get; set; }

    public decimal? Protein { get; set; }

    public decimal? Carbs { get; set; }

    public decimal? Fat { get; set; }

    public virtual ICollection<BowlItem> BowlItems { get; set; } = new List<BowlItem>();

    public virtual CategoriesIngredient? CategoriesIngredients { get; set; }

    public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();

    public virtual ICollection<OrderItemIngredient> OrderItemIngredients { get; set; } = new List<OrderItemIngredient>();

    public virtual ICollection<ProductIngredient> ProductIngredients { get; set; } = new List<ProductIngredient>();

    public virtual ICollection<StoreInventory> StoreInventories { get; set; } = new List<StoreInventory>();
}
