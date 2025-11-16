using System;
using System.Collections.Generic;

namespace ITHealthy.DTOs
{
    public class OrderDTO
    {
        public int OrderId { get; set; }
        public int? CustomerId { get; set; }
        public int? StoreId { get; set; }
        public DateTime? OrderDate { get; set; }

        public decimal? FinalPrice { get; set; }
        public string? StatusOrder { get; set; }
        public string OrderType { get; set; }
        public string? OrderNote { get; set; }

        // Tên khách hàng, cửa hàng
        public string? FullName { get; set; }
        public string? StoreName { get; set; }

        // Các item trong đơn hàng
        public List<OrderItemDTO> OrderItems { get; set; } = new();
    }
}
