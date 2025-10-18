using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class ComboItem
{
    public int ComboItemId { get; set; }

    public int ComboId { get; set; }

    public int ProductId { get; set; }

    public int? Quantity { get; set; }

    public virtual Combo Combo { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;
}
