using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHealthy.Models;

public partial class PromotionProduct
{
    public int PromotionProductId { get; set; }

    public int PromotionId { get; set; }

    public int ProductId { get; set; }

    public virtual Product Product { get; set; } = null!;

    public virtual Promotion Promotion { get; set; } = null!;
    [NotMapped]
    public string? ProductName => Product != null ? Product.ProductName : null;
    public string? PromotionName => Promotion != null ? Promotion.PromotionName : null;
}
