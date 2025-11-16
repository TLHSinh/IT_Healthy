namespace ITHealthy.DTOs
{
    public class StoreDTO
    {
        public int StoreId { get; set; }

        public string StoreName { get; set; } = null!;

        public string? Phone { get; set; }

        // Địa chỉ chi tiết
        public string StreetAddress { get; set; } = null!;

        public string? Ward { get; set; }

        public string? District { get; set; }

        public string? City { get; set; }

        public string? Country { get; set; } = "Việt Nam";

        public string? Postcode { get; set; }

        // Tọa độ bản đồ
        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }

        public string? GooglePlaceId { get; set; }

        public decimal? Rating { get; set; }

        public DateOnly? DateJoined { get; set; }

        public bool? IsActive { get; set; }

    }
}
