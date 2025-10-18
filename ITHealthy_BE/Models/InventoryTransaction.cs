using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class InventoryTransaction
{
    public int InventoryTransactionId { get; set; }

    public int StoreId { get; set; }

    public int IngredientId { get; set; }

    public decimal ChangeQuantity { get; set; }

    public decimal? BeforeQuantity { get; set; }

    public decimal? AfterQuantity { get; set; }

    public string? ReferenceType { get; set; }

    public int? ReferenceId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? CreatedBy { get; set; }

    public virtual Ingredient Ingredient { get; set; } = null!;

    public virtual Store Store { get; set; } = null!;
}
