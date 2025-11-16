using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHealthy.Models;

public partial class PromotionStore
{
    public int PromotionStoreId { get; set; }

    public int PromotionId { get; set; }

    public int StoreId { get; set; }

    public virtual Promotion Promotion { get; set; } = null!;

    public virtual Store Store { get; set; } = null!;

    [NotMapped]
    public string? StoreName => Store != null ? Store.StoreName : null;
    public string? PromotionName => Promotion != null ? Promotion.PromotionName : null;
}
