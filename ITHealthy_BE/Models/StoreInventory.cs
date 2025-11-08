using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ITHealthy.Models;

public partial class StoreInventory
{
    public int StoreIngredientId { get; set; }

    public int StoreId { get; set; }

    public int IngredientId { get; set; }

    public decimal? StockQuantity { get; set; }

    public decimal? ReorderLevel { get; set; }

    public DateTime? LastUpdated { get; set; }

    // public virtual Ingredient Ingredient { get; set; } = null!;

    // public virtual Store Store { get; set; } = null!;

    // [NotMapped]
    // public string? IngredientName => Ingredient != null ? Ingredient.IngredientName : null;

    // public string? StoreName => Store != null ? Store.StoreName : null;
    [JsonIgnore]
    public virtual Ingredient? Ingredient { get; set; }

    [JsonIgnore]
    public virtual Store? Store { get; set; }

    // 🟢 Dùng để hiển thị khi GET, không ánh xạ DB
    [NotMapped]
    public string? IngredientName { get; set; }

    [NotMapped]
    public string? StoreName { get; set; }
}
