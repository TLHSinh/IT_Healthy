using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class ProductIngredient
{
    public int ProductIngredientId { get; set; }

    public int ProductId { get; set; }

    public int IngredientId { get; set; }

    public decimal Quantity { get; set; }

    public virtual Ingredient Ingredient { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
