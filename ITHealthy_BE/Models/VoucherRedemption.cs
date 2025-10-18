using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class VoucherRedemption
{
    public int RedemptionId { get; set; }

    public int? VoucherId { get; set; }

    public int? OrderId { get; set; }

    public int? CustomerId { get; set; }

    public DateTime? RedeemedAt { get; set; }

    public decimal? Amount { get; set; }

    public virtual Customer? Customer { get; set; }

    public virtual Order? Order { get; set; }

    public virtual Voucher? Voucher { get; set; }
}
