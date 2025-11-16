using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHealthy.Models;

public partial class PromotionCategory
{
    public int PromotionCategoryId { get; set; }

    public int PromotionId { get; set; }

    public int CategoryId { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual Promotion Promotion { get; set; } = null!;

    [NotMapped]
    public string? CategoryName => Category != null ? Category.CategoryName : null;
    public string? PromotionName => Promotion != null ? Promotion.PromotionName : null;
}
