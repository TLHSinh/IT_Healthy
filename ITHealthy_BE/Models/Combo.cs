using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class Combo
{
    public int ComboId { get; set; }

    public string ComboName { get; set; } = null!;

    public string? DescriptionCombo { get; set; }

    public decimal? Price { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string? ImageCombo { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual ICollection<ComboItem> ComboItems { get; set; } = new List<ComboItem>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
