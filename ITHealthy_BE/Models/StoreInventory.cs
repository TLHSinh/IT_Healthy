using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class StoreInventory
{
    public int StoreIngredientId { get; set; }

    public int StoreId { get; set; }

    public int IngredientId { get; set; }

    public decimal? StockQuantity { get; set; }

    public decimal? ReorderLevel { get; set; }

    public DateTime? LastUpdated { get; set; }

    public virtual Ingredient Ingredient { get; set; } = null!;

    public virtual Store Store { get; set; } = null!;
}
