using System;
using System.Collections.Generic;

namespace ITHealthy.Models;

public partial class Store
{
    public int StoreId { get; set; }

    public string StoreName { get; set; } = null!;

    public string? Phone { get; set; }

    public string? AddressStore { get; set; }

    public decimal? Rating { get; set; }

    public DateOnly? DateJoined { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<PromotionStore> PromotionStores { get; set; } = new List<PromotionStore>();

    public virtual ICollection<Revenue> Revenues { get; set; } = new List<Revenue>();

    public virtual ICollection<Staff> Staff { get; set; } = new List<Staff>();

    public virtual ICollection<StoreInventory> StoreInventories { get; set; } = new List<StoreInventory>();

    public virtual ICollection<StoreProduct> StoreProducts { get; set; } = new List<StoreProduct>();

    public virtual ICollection<VoucherStore> VoucherStores { get; set; } = new List<VoucherStore>();
}
