namespace ITHealthy.DTOs
{
    public class OrderItemDTO
    {
        public int OrderItemId { get; set; }
        public int? ProductId { get; set; }
        public int? ComboId { get; set; }
        public int? BowlId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal? TotalPrice { get; set; }

        // Thông tin sản phẩm/ combo / bowl
        public string? ProductName { get; set; }
        public string? ComboName { get; set; }
        public string? BowlName { get; set; }
    }
}
