using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHealthy.Models;

public partial class StoreProduct
{
    public int StoreProductId { get; set; }

    public int? StoreId { get; set; }

    public int? ProductId { get; set; }

    public decimal? Price { get; set; }

    public int? Stock { get; set; }

    public bool? IsAvailable { get; set; }

    public virtual Product? Product { get; set; }

    public virtual ICollection<ProductPriceHistory> ProductPriceHistories { get; set; } = new List<ProductPriceHistory>();

    public virtual Store? Store { get; set; }

    [NotMapped]
    public string? StoreName => Store != null ? Store.StoreName : null;
    public string? ProductName => Product != null ? Product.ProductName : null;
}
