using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class ProductPriceHistory
{
    public int HistoryId { get; set; }

    public int? StoreProductId { get; set; }

    public decimal? OldPrice { get; set; }

    public decimal? NewPrice { get; set; }

    public DateTime? ChangedAt { get; set; }

    public string? ChangedBy { get; set; }

    public virtual StoreProduct? StoreProduct { get; set; }
}
