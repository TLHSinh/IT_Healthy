public class VoucherCreateRequest
    {
        public string Code { get; set; }
        public string DescriptionVou { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? ExpiryDate { get; set; }
        public string DiscountType { get; set; }
        public decimal? DiscountValue { get; set; }
        public decimal? MinOrderAmount { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public int? MaxUsage { get; set; }
        public int PerCustomerLimit { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsStackable { get; set; } = false;

        public List<int>? StoreIDs { get; set; }
        public List<int>? ProductIDs { get; set; }
        public List<int>? CategoryIDs { get; set; }
    }