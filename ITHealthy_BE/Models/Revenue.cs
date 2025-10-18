using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class Revenue
{
    public int RevenueId { get; set; }

    public int? StoreId { get; set; }

    public DateOnly RevenueDate { get; set; }

    public decimal? TotalSales { get; set; }

    public int? TotalOrders { get; set; }

    public string? RevenueType { get; set; }

    public virtual Store? Store { get; set; }
}
