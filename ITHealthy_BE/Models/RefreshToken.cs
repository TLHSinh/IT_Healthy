using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace ITHealthy.Models;

public partial class RefreshToken
{
    public int Id { get; set; }

    public string Token { get; set; } = null!;

    public DateTime Expires { get; set; }

    public DateTime Created { get; set; }

    public string? CreatedById { get; set; }

    public DateTime? Revoked { get; set; }

    public string? RevokedById { get; set; }

    public string? ReplacedByToken { get; set; }

    public int CustomerId { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    [NotMapped]
    public bool isExpired => DateTime.UtcNow >= Expires;

    [NotMapped]
    public bool isActive => Revoked == null && !isExpired;
}
