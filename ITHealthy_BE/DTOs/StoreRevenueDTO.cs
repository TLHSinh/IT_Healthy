namespace ITHealthy.DTOs
{
    public class StoreRevenueDTO
    {
        public int StoreId { get; set; }
        public string StoreName { get; set; } = null!;
        public int Year { get; set; }
        public int Month { get; set; }
        public int Day { get; set; } // 0 nếu thống kê theo tháng
        public decimal TotalRevenue { get; set; }
    }
}
