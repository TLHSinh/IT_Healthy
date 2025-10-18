using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class CourierService
{
    public int CourierId { get; set; }

    public string? CourierName { get; set; }

    public decimal? BaseFee { get; set; }

    public decimal? FeePerKm { get; set; }

    public string? EstimatedTime { get; set; }

    public string? CoverageArea { get; set; }

    public bool? IsActive { get; set; }
}
