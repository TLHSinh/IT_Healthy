using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class Bowl
{
    public int BowlId { get; set; }

    public int? CustomerId { get; set; }

    public string? BowlName { get; set; }

    public decimal? BaseCalories { get; set; }

    public decimal? BasePrice { get; set; }

    public decimal? TotalProtein { get; set; }

    public decimal? TotalCarbs { get; set; }

    public decimal? TotalFat { get; set; }

    public decimal? TotalPrice { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<BowlItem> BowlItems { get; set; } = new List<BowlItem>();

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual Customer? Customer { get; set; }

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
