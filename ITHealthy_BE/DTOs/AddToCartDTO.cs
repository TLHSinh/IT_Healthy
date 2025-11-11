namespace ITHealthy.DTOs
{
    public class AddToCartDto
    {
        public int CustomerId { get; set; }
        public int? ProductId { get; set; }
        public int? ComboId { get; set; }
        public int? BowlId { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal? UnitPrice { get; set; }
    }
}