using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHealthy.Models;

public partial class ProductIngredient
{
    public int ProductIngredientId { get; set; }

    public int ProductId { get; set; }

    public int IngredientId { get; set; }

    public decimal Quantity { get; set; }

    public virtual Ingredient Ingredient { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;

    [NotMapped]
    public string? ProductName => Product != null ? Product.ProductName : null;
    public string? IngredientName => Ingredient != null ? Ingredient.IngredientName : null;
}
