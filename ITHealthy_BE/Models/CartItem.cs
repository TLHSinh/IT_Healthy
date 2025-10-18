using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class CartItem
{
    public int CartItemId { get; set; }

    public int CartId { get; set; }

    public int? ProductId { get; set; }

    public int? ComboId { get; set; }

    public int? BowlId { get; set; }

    public int Quantity { get; set; }

    public decimal? UnitPrice { get; set; }

    public DateTime? AddedAt { get; set; }

    public virtual Bowl? Bowl { get; set; }

    public virtual Cart Cart { get; set; } = null!;

    public virtual Combo? Combo { get; set; }

    public virtual Product? Product { get; set; }
}
