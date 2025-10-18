using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class OrderItem
{
    public int OrderItemId { get; set; }

    public int? OrderId { get; set; }

    public int? ProductId { get; set; }

    public int? ComboId { get; set; }

    public int? BowlId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal? TotalPrice { get; set; }

    public virtual Bowl? Bowl { get; set; }

    public virtual Combo? Combo { get; set; }

    public virtual Order? Order { get; set; }

    public virtual ICollection<OrderItemIngredient> OrderItemIngredients { get; set; } = new List<OrderItemIngredient>();

    public virtual Product? Product { get; set; }
}
