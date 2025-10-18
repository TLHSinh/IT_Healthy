using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class BowlItem
{
    public int BowlItemId { get; set; }

    public int BowlId { get; set; }

    public int IngredientId { get; set; }

    public decimal Quantity { get; set; }

    public decimal? Price { get; set; }

    public virtual Bowl Bowl { get; set; } = null!;

    public virtual Ingredient Ingredient { get; set; } = null!;
}
