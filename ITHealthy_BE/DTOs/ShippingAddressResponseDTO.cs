// DTOs/ShippingAddressResponseDTO.cs
namespace ITHealthy.DTOs
{
    public class ShippingAddressResponseDTO
    {
        public int ShippingId { get; set; }
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

        public bool? IsDefault { get; set; }

        // Thông tin giao hàng kèm theo (nếu FE cần hiển thị)
        public string? CourierName { get; set; }
        public DateTime? ShipDate { get; set; }
        public string? ShipTime { get; set; }
        public decimal? Cost { get; set; }
    }
}
