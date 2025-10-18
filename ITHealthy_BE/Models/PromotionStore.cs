using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class PromotionStore
{
    public int PromotionStoreId { get; set; }

    public int PromotionId { get; set; }

    public int StoreId { get; set; }

    public virtual Promotion Promotion { get; set; } = null!;

    public virtual Store Store { get; set; } = null!;
}
