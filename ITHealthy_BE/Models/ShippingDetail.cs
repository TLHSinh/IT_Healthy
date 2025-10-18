using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class ShippingDetail
{
    public int ShippingId { get; set; }

    public int? OrderId { get; set; }

    public int? AddressId { get; set; }

    public string? CourierName { get; set; }

    public DateOnly? ShipDate { get; set; }

    public string? ShipTime { get; set; }

    public decimal? Cost { get; set; }

    public virtual CustomerAddress? Address { get; set; }

    public virtual Order? Order { get; set; }
}
