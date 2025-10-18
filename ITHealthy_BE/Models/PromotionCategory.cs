using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class PromotionCategory
{
    public int PromotionCategoryId { get; set; }

    public int PromotionId { get; set; }

    public int CategoryId { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual Promotion Promotion { get; set; } = null!;
}
