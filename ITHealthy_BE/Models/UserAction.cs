using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class UserAction
{
    public int ActionId { get; set; }

    public int CustomerId { get; set; }

    public int? ProductId { get; set; }

    public string ActionType { get; set; } = null!;

    public DateTime? ActionTime { get; set; }

    public string? Metadata { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual Product? Product { get; set; }
}
