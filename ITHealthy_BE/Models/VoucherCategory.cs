using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class VoucherCategory
{
    public int VoucherCategoryId { get; set; }

    public int VoucherId { get; set; }

    public int CategoryId { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual Voucher Voucher { get; set; } = null!;
}
