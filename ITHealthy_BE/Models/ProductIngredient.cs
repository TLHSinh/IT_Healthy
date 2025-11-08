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

    // Cho phép null để FE chỉ gửi Id mà không cần gửi object
    public virtual Ingredient? Ingredient { get; set; }

    public virtual Product? Product { get; set; }

    [NotMapped]
    public string? ProductName => Product?.ProductName;

    [NotMapped]
    public string? IngredientName => Ingredient?.IngredientName;
}
