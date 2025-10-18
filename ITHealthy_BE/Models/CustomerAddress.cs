using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class CustomerAddress
{
    public int AddressId { get; set; }

    public int CustomerId { get; set; }

    public string ReceiverName { get; set; } = null!;

    public string PhoneNumber { get; set; } = null!;

    public string StreetAddress { get; set; } = null!;

    public string? Ward { get; set; }

    public string? District { get; set; }

    public string? City { get; set; }

    public string? Country { get; set; }

    public string? Postcode { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public string? GooglePlaceId { get; set; }

    public string? AddressType { get; set; }

    public bool? IsDefault { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ICollection<ShippingDetail> ShippingDetails { get; set; } = new List<ShippingDetail>();
}
