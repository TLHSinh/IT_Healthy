using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class SavedPaymentMethod
{
    public int SavedPaymentId { get; set; }

    public int CustomerId { get; set; }

    public int PaymentMethodId { get; set; }

    public string? Provider { get; set; }

    public string? CardNumberMasked { get; set; }

    public int? ExpiryMonth { get; set; }

    public int? ExpiryYear { get; set; }

    public DateTime? CreatedAt { get; set; }

    public bool? IsDefault { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual PaymentMethod PaymentMethod { get; set; } = null!;
}
