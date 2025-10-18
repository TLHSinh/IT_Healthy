using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class VoucherStore
{
    public int VoucherStoreId { get; set; }

    public int VoucherId { get; set; }

    public int StoreId { get; set; }

    public virtual Store Store { get; set; } = null!;

    public virtual Voucher Voucher { get; set; } = null!;
}
