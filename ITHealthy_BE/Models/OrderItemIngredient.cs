using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class OrderItemIngredient
{
    public int OrderItemIngredientId { get; set; }

    public int OrderItemId { get; set; }

    public int IngredientId { get; set; }

    public decimal Quantity { get; set; }

    public virtual Ingredient Ingredient { get; set; } = null!;

    public virtual OrderItem OrderItem { get; set; } = null!;
}
