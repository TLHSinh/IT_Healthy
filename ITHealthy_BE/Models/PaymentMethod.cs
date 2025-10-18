using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class PaymentMethod
{
    public int PaymentMethodId { get; set; }

    public string? MethodName { get; set; }

    public string? DescriptionPayMethod { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<SavedPaymentMethod> SavedPaymentMethods { get; set; } = new List<SavedPaymentMethod>();
}
