using System;
using System.Collections.Generic;
using ITHealthy.Models;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Data;

public partial class ITHealthyDbContext : DbContext
{
    public ITHealthyDbContext()
    {
    }

    public ITHealthyDbContext(DbContextOptions<ITHealthyDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Bowl> Bowls { get; set; }

    public virtual DbSet<BowlItem> BowlItems { get; set; }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<CartItem> CartItems { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Combo> Combos { get; set; }

    public virtual DbSet<ComboItem> ComboItems { get; set; }

    public virtual DbSet<CourierService> CourierServices { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<CustomerAddress> CustomerAddresses { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<Ingredient> Ingredients { get; set; }

    public virtual DbSet<InventoryTransaction> InventoryTransactions { get; set; }

    public virtual DbSet<LoginHistory> LoginHistories { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<OrderItemIngredient> OrderItemIngredients { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<PaymentMethod> PaymentMethods { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductIngredient> ProductIngredients { get; set; }

    public virtual DbSet<ProductPriceHistory> ProductPriceHistories { get; set; }

    public virtual DbSet<Promotion> Promotions { get; set; }

    public virtual DbSet<PromotionCategory> PromotionCategories { get; set; }

    public virtual DbSet<PromotionProduct> PromotionProducts { get; set; }

    public virtual DbSet<PromotionStore> PromotionStores { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Revenue> Revenues { get; set; }

    public virtual DbSet<SavedPaymentMethod> SavedPaymentMethods { get; set; }

    public virtual DbSet<ShippingDetail> ShippingDetails { get; set; }

    public virtual DbSet<Staff> Staff { get; set; }

    public virtual DbSet<Store> Stores { get; set; }

    public virtual DbSet<StoreInventory> StoreInventories { get; set; }

    public virtual DbSet<StoreProduct> StoreProducts { get; set; }

    public virtual DbSet<UserAction> UserActions { get; set; }

    public virtual DbSet<UserOtp> UserOtps { get; set; }

    public virtual DbSet<UserPreference> UserPreferences { get; set; }

    public virtual DbSet<Voucher> Vouchers { get; set; }

    public virtual DbSet<VoucherCategory> VoucherCategories { get; set; }

    public virtual DbSet<VoucherProduct> VoucherProducts { get; set; }

    public virtual DbSet<VoucherRedemption> VoucherRedemptions { get; set; }

    public virtual DbSet<VoucherStore> VoucherStores { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {

    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bowl>(entity =>
        {
            entity.HasKey(e => e.BowlId).HasName("PK__Bowls__C923F6C95F41575B");

            entity.Property(e => e.BowlId).HasColumnName("BowlID");
            entity.Property(e => e.BaseCalories).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.BasePrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.BowlName).HasMaxLength(100);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.TotalCarbs).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.TotalFat).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.TotalProtein).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Customer).WithMany(p => p.Bowls)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__Bowls__CustomerI__02084FDA");
        });

        modelBuilder.Entity<BowlItem>(entity =>
        {
            entity.HasKey(e => e.BowlItemId).HasName("PK__BowlItem__33A2521F70DB0FAA");

            entity.HasIndex(e => new { e.BowlId, e.IngredientId }, "UQ_Bowl_Ingredient").IsUnique();

            entity.Property(e => e.BowlItemId).HasColumnName("BowlItemID");
            entity.Property(e => e.BowlId).HasColumnName("BowlID");
            entity.Property(e => e.IngredientId).HasColumnName("IngredientID");
            entity.Property(e => e.Price).HasColumnType("decimal(12, 4)");
            entity.Property(e => e.Quantity).HasColumnType("decimal(12, 4)");

            entity.HasOne(d => d.Bowl).WithMany(p => p.BowlItems)
                .HasForeignKey(d => d.BowlId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BowlItems__BowlI__06CD04F7");

            entity.HasOne(d => d.Ingredient).WithMany(p => p.BowlItems)
                .HasForeignKey(d => d.IngredientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BowlItems__Ingre__07C12930");
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.CartId).HasName("PK__Carts__51BCD797CD50A85B");

            entity.Property(e => e.CartId).HasColumnName("CartID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.ReorderFromOrderId).HasColumnName("ReorderFromOrderID");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Customer).WithMany(p => p.Carts)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Carts__CustomerI__55009F39");

            entity.HasOne(d => d.ReorderFromOrder).WithMany(p => p.Carts)
                .HasForeignKey(d => d.ReorderFromOrderId)
                .HasConstraintName("FK__Carts__ReorderFr__57DD0BE4");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.CartItemId).HasName("PK__CartItem__488B0B2A87D18703");

            entity.Property(e => e.CartItemId).HasColumnName("CartItemID");
            entity.Property(e => e.AddedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.BowlId).HasColumnName("BowlID");
            entity.Property(e => e.CartId).HasColumnName("CartID");
            entity.Property(e => e.ComboId).HasColumnName("ComboID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Bowl).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.BowlId)
                .HasConstraintName("FK__CartItems__BowlI__5D95E53A");

            entity.HasOne(d => d.Cart).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.CartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CartItems__CartI__5AB9788F");

            entity.HasOne(d => d.Combo).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.ComboId)
                .HasConstraintName("FK__CartItems__Combo__5CA1C101");

            entity.HasOne(d => d.Product).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__CartItems__Produ__5BAD9CC8");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A2B0E7D64A8");

            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CategoryName).HasMaxLength(100);
            entity.Property(e => e.DescriptionCat).HasMaxLength(255);
        });

        modelBuilder.Entity<Combo>(entity =>
        {
            entity.HasKey(e => e.ComboId).HasName("PK__Combos__DD42580EFB19EB7F");

            entity.Property(e => e.ComboId).HasColumnName("ComboID");
            entity.Property(e => e.ComboName).HasMaxLength(100);
            entity.Property(e => e.DescriptionCombo).HasMaxLength(500);
            entity.Property(e => e.ImageCombo).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
        });

        modelBuilder.Entity<ComboItem>(entity =>
        {
            entity.HasKey(e => e.ComboItemId).HasName("PK__ComboIte__EE32F8E56BDB0D87");

            entity.HasIndex(e => new { e.ComboId, e.ProductId }, "UQ_Combo_Product").IsUnique();

            entity.Property(e => e.ComboItemId).HasColumnName("ComboItemID");
            entity.Property(e => e.ComboId).HasColumnName("ComboID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.Quantity).HasDefaultValue(1);

            entity.HasOne(d => d.Combo).WithMany(p => p.ComboItems)
                .HasForeignKey(d => d.ComboId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ComboItem__Combo__7D439ABD");

            entity.HasOne(d => d.Product).WithMany(p => p.ComboItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ComboItem__Produ__7E37BEF6");
        });

        modelBuilder.Entity<CourierService>(entity =>
        {
            entity.HasKey(e => e.CourierId).HasName("PK__CourierS__CDAE76F69915BD3A");

            entity.Property(e => e.CourierId).HasColumnName("CourierID");
            entity.Property(e => e.BaseFee).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.CourierName).HasMaxLength(100);
            entity.Property(e => e.CoverageArea).HasMaxLength(255);
            entity.Property(e => e.EstimatedTime).HasMaxLength(50);
            entity.Property(e => e.FeePerKm).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("PK__Customer__A4AE64B86BF2C0BD");

            entity.HasIndex(e => e.Phone, "UQ__Customer__5C7E359E29AF1BE9").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Customer__A9D1053428FEC4FA").IsUnique();

            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.Avatar).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Dob).HasColumnName("DOB");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.Gender)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength();
            entity.Property(e => e.PasswordHash).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(15);
            entity.Property(e => e.RoleUser).HasMaxLength(50);

        });

        modelBuilder.Entity<CustomerAddress>(entity =>
        {
            entity.HasKey(e => e.AddressId).HasName("PK__Customer__091C2A1BDB270134");

            entity.Property(e => e.AddressId).HasColumnName("AddressID");
            entity.Property(e => e.AddressType)
                .HasMaxLength(50)
                .HasDefaultValue("Nhà riêng");
            entity.Property(e => e.City).HasMaxLength(100);
            entity.Property(e => e.Country)
                .HasMaxLength(100)
                .HasDefaultValue("Việt Nam");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.District).HasMaxLength(100);
            entity.Property(e => e.GooglePlaceId)
                .HasMaxLength(255)
                .HasColumnName("GooglePlaceID");
            entity.Property(e => e.IsDefault).HasDefaultValue(false);
            entity.Property(e => e.Latitude).HasColumnType("decimal(9, 6)");
            entity.Property(e => e.Longitude).HasColumnType("decimal(9, 6)");
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Postcode).HasMaxLength(10);
            entity.Property(e => e.ReceiverName).HasMaxLength(100);
            entity.Property(e => e.StreetAddress).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Ward).HasMaxLength(100);

            entity.HasOne(d => d.Customer).WithMany(p => p.CustomerAddresses)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CustomerA__Custo__3F466844");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__6A4BEDF62AA89968");

            entity.Property(e => e.FeedbackId).HasColumnName("FeedbackID");
            entity.Property(e => e.ComboId).HasColumnName("ComboID");
            entity.Property(e => e.Comment).HasMaxLength(500);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");

            entity.HasOne(d => d.Combo).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.ComboId)
                .HasConstraintName("FK__Feedbacks__Combo__6FB49575");

            entity.HasOne(d => d.Customer).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__Feedbacks__Custo__6DCC4D03");

            entity.HasOne(d => d.Product).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__Feedbacks__Produ__6EC0713C");
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.IngredientId).HasName("PK__Ingredie__BEAEB27A359EF5C6");

            entity.Property(e => e.IngredientId).HasColumnName("IngredientID");
            entity.Property(e => e.BasePrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Calories).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Carbs).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Fat).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.IngredientName).HasMaxLength(100);
            entity.Property(e => e.Protein).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Unit).HasMaxLength(20);
        });

        modelBuilder.Entity<InventoryTransaction>(entity =>
        {
            entity.HasKey(e => e.InventoryTransactionId).HasName("PK__Inventor__0863F8685A003D48");

            entity.Property(e => e.InventoryTransactionId).HasColumnName("InventoryTransactionID");
            entity.Property(e => e.AfterQuantity).HasColumnType("decimal(12, 4)");
            entity.Property(e => e.BeforeQuantity).HasColumnType("decimal(12, 4)");
            entity.Property(e => e.ChangeQuantity).HasColumnType("decimal(12, 4)");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CreatedBy).HasMaxLength(100);
            entity.Property(e => e.IngredientId).HasColumnName("IngredientID");
            entity.Property(e => e.ReferenceId).HasColumnName("ReferenceID");
            entity.Property(e => e.ReferenceType).HasMaxLength(50);
            entity.Property(e => e.StoreId).HasColumnName("StoreID");

            entity.HasOne(d => d.Ingredient).WithMany(p => p.InventoryTransactions)
                .HasForeignKey(d => d.IngredientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Inventory__Ingre__7FEAFD3E");

            entity.HasOne(d => d.Store).WithMany(p => p.InventoryTransactions)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Inventory__Store__7EF6D905");
        });

        modelBuilder.Entity<LoginHistory>(entity =>
        {
            entity.HasKey(e => e.LoginId).HasName("PK__LoginHis__4DDA2838DC983A63");

            entity.ToTable("LoginHistory");

            entity.Property(e => e.LoginId).HasColumnName("LoginID");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.DeviceInfo).HasMaxLength(255);
            entity.Property(e => e.Ipaddress)
                .HasMaxLength(50)
                .HasColumnName("IPAddress");
            entity.Property(e => e.LoginTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.LogoutTime).HasColumnType("datetime");
            entity.Property(e => e.Reason).HasMaxLength(255);
            entity.Property(e => e.StatusLog).HasMaxLength(20);

            entity.HasOne(d => d.Customer).WithMany(p => p.LoginHistories)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__LoginHist__Custo__4D94879B");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__C3905BAFC12495B5");

            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.DiscountApplied).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.FinalPrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.InventoryDeducted).HasDefaultValue(false);
            entity.Property(e => e.OrderDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PromotionId).HasColumnName("PromotionID");
            entity.Property(e => e.StatusOrder)
                .HasMaxLength(30)
                .HasDefaultValue("Pending");
            entity.Property(e => e.StoreId).HasColumnName("StoreID");
            entity.Property(e => e.TotalPrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__Orders__Customer__3493CFA7");

            entity.HasOne(d => d.Promotion).WithMany(p => p.Orders)
                .HasForeignKey(d => d.PromotionId)
                .HasConstraintName("FK__Orders__Promotio__37703C52");

            entity.HasOne(d => d.Store).WithMany(p => p.Orders)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK__Orders__StoreID__3587F3E0");

            entity.HasOne(d => d.Voucher).WithMany(p => p.Orders)
                .HasForeignKey(d => d.VoucherId)
                .HasConstraintName("FK__Orders__VoucherI__367C1819");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.OrderItemId).HasName("PK__OrderIte__57ED06A168453219");

            entity.Property(e => e.OrderItemId).HasColumnName("OrderItemID");
            entity.Property(e => e.BowlId).HasColumnName("BowlID");
            entity.Property(e => e.ComboId).HasColumnName("ComboID");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.TotalPrice)
                .HasComputedColumnSql("([Quantity]*[UnitPrice])", true)
                .HasColumnType("decimal(21, 2)");
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Bowl).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.BowlId)
                .HasConstraintName("FK__OrderItem__BowlI__40F9A68C");

            entity.HasOne(d => d.Combo).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ComboId)
                .HasConstraintName("FK__OrderItem__Combo__40058253");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__OrderItem__Order__3E1D39E1");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__OrderItem__Produ__3F115E1A");
        });

        modelBuilder.Entity<OrderItemIngredient>(entity =>
        {
            entity.HasKey(e => e.OrderItemIngredientId).HasName("PK__OrderIte__6DC447D5EA9FED46");

            entity.Property(e => e.OrderItemIngredientId).HasColumnName("OrderItemIngredientID");
            entity.Property(e => e.IngredientId).HasColumnName("IngredientID");
            entity.Property(e => e.OrderItemId).HasColumnName("OrderItemID");
            entity.Property(e => e.Quantity).HasColumnType("decimal(12, 4)");

            entity.HasOne(d => d.Ingredient).WithMany(p => p.OrderItemIngredients)
                .HasForeignKey(d => d.IngredientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderItem__Ingre__04AFB25B");

            entity.HasOne(d => d.OrderItem).WithMany(p => p.OrderItemIngredients)
                .HasForeignKey(d => d.OrderItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderItem__Order__03BB8E22");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__9B556A5836B4F8A9");

            entity.Property(e => e.PaymentId).HasColumnName("PaymentID");
            entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.PaymentDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.Order).WithMany(p => p.Payments)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__Payments__OrderI__44CA3770");
        });

        modelBuilder.Entity<PaymentMethod>(entity =>
        {
            entity.HasKey(e => e.PaymentMethodId).HasName("PK__PaymentM__DC31C1F3C8DC1ED8");

            entity.Property(e => e.PaymentMethodId).HasColumnName("PaymentMethodID");
            entity.Property(e => e.DescriptionPayMethod).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MethodName).HasMaxLength(50);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Products__B40CC6EDCAA861A4");

            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.BasePrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Calories).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Carbs).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DescriptionProduct).HasMaxLength(500);
            entity.Property(e => e.Fat).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.ImageProduct).HasMaxLength(255);
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
            entity.Property(e => e.ProductName).HasMaxLength(100);
            entity.Property(e => e.Protein).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Category).WithMany(p => p.Products)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__Products__Catego__693CA210");
        });

        modelBuilder.Entity<ProductIngredient>(entity =>
        {
            entity.HasKey(e => e.ProductIngredientId).HasName("PK__ProductI__07480704B0162BC7");

            entity.HasIndex(e => new { e.ProductId, e.IngredientId }, "UQ_Product_Ingredient").IsUnique();

            entity.Property(e => e.ProductIngredientId).HasColumnName("ProductIngredientID");
            entity.Property(e => e.IngredientId).HasColumnName("IngredientID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.Quantity).HasColumnType("decimal(12, 4)");

            entity.HasOne(d => d.Ingredient).WithMany(p => p.ProductIngredients)
                .HasForeignKey(d => d.IngredientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ProductIn__Ingre__6FE99F9F");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductIngredients)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ProductIn__Produ__6EF57B66");
        });

        modelBuilder.Entity<ProductPriceHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId).HasName("PK__ProductP__4D7B4ADD6F86519D");

            entity.ToTable("ProductPriceHistory");

            entity.Property(e => e.HistoryId).HasColumnName("HistoryID");
            entity.Property(e => e.ChangedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ChangedBy).HasMaxLength(100);
            entity.Property(e => e.NewPrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.OldPrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.StoreProductId).HasColumnName("StoreProductID");

            entity.HasOne(d => d.StoreProduct).WithMany(p => p.ProductPriceHistories)
                .HasForeignKey(d => d.StoreProductId)
                .HasConstraintName("FK__ProductPr__Store__7B264821");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__52C42F2F3C419662");

            entity.Property(e => e.PromotionId).HasColumnName("PromotionID");
            entity.Property(e => e.DescriptionPromotion).HasMaxLength(500);
            entity.Property(e => e.DiscountType).HasMaxLength(20);
            entity.Property(e => e.DiscountValue).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MinOrderAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(12, 2)");
            entity.Property(e => e.PromotionName).HasMaxLength(200);
        });

        modelBuilder.Entity<PromotionCategory>(entity =>
        {
            entity.HasKey(e => e.PromotionCategoryId).HasName("PK__Promotio__0D44A88991228B66");

            entity.HasIndex(e => new { e.PromotionId, e.CategoryId }, "UQ_Promotion_Category").IsUnique();

            entity.Property(e => e.PromotionCategoryId).HasColumnName("PromotionCategoryID");
            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.PromotionId).HasColumnName("PromotionID");

            entity.HasOne(d => d.Category).WithMany(p => p.PromotionCategories)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Categ__1AD3FDA4");

            entity.HasOne(d => d.Promotion).WithMany(p => p.PromotionCategories)
                .HasForeignKey(d => d.PromotionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Promo__19DFD96B");
        });

        modelBuilder.Entity<PromotionProduct>(entity =>
        {
            entity.HasKey(e => e.PromotionProductId).HasName("PK__Promotio__C7B85D3C52FF179C");

            entity.HasIndex(e => new { e.PromotionId, e.ProductId }, "UQ_Promotion_Product").IsUnique();

            entity.Property(e => e.PromotionProductId).HasColumnName("PromotionProductID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.PromotionId).HasColumnName("PromotionID");

            entity.HasOne(d => d.Product).WithMany(p => p.PromotionProducts)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Produ__160F4887");

            entity.HasOne(d => d.Promotion).WithMany(p => p.PromotionProducts)
                .HasForeignKey(d => d.PromotionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Promo__151B244E");
        });

        modelBuilder.Entity<PromotionStore>(entity =>
        {
            entity.HasKey(e => e.PromotionStoreId).HasName("PK__Promotio__E040054E7C6ED922");

            entity.HasIndex(e => new { e.PromotionId, e.StoreId }, "UQ_Promotion_Store").IsUnique();

            entity.Property(e => e.PromotionStoreId).HasColumnName("PromotionStoreID");
            entity.Property(e => e.PromotionId).HasColumnName("PromotionID");
            entity.Property(e => e.StoreId).HasColumnName("StoreID");

            entity.HasOne(d => d.Promotion).WithMany(p => p.PromotionStores)
                .HasForeignKey(d => d.PromotionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Promo__10566F31");

            entity.HasOne(d => d.Store).WithMany(p => p.PromotionStores)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Store__114A936A");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RefreshT__3214EC07555939AE");

            entity.ToTable("RefreshToken");

            entity.Property(e => e.Created).HasColumnType("datetime");
            entity.Property(e => e.CreatedById).HasMaxLength(255);
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.Expires).HasColumnType("datetime");
            entity.Property(e => e.ReplacedByToken).HasMaxLength(255);
            entity.Property(e => e.Revoked).HasColumnType("datetime");
            entity.Property(e => e.RevokedById).HasMaxLength(255);
            entity.Property(e => e.Token).HasMaxLength(255);

            entity.HasOne(d => d.Customer).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__RefreshTo__Custo__3C69FB99");
        });

        modelBuilder.Entity<Revenue>(entity =>
        {
            entity.HasKey(e => e.RevenueId).HasName("PK__Revenue__275F173D9114486A");

            entity.ToTable("Revenue");

            entity.HasIndex(e => new { e.StoreId, e.RevenueDate, e.RevenueType }, "UQ_Store_Date_Type").IsUnique();

            entity.Property(e => e.RevenueId).HasColumnName("RevenueID");
            entity.Property(e => e.RevenueType).HasMaxLength(10);
            entity.Property(e => e.StoreId).HasColumnName("StoreID");
            entity.Property(e => e.TotalOrders).HasDefaultValue(0);
            entity.Property(e => e.TotalSales)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(15, 2)");

            entity.HasOne(d => d.Store).WithMany(p => p.Revenues)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK__Revenue__StoreID__756D6ECB");
        });

        modelBuilder.Entity<SavedPaymentMethod>(entity =>
        {
            entity.HasKey(e => e.SavedPaymentId).HasName("PK__SavedPay__446C86351BE3325A");

            entity.Property(e => e.SavedPaymentId).HasColumnName("SavedPaymentID");
            entity.Property(e => e.CardNumberMasked).HasMaxLength(20);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.IsDefault).HasDefaultValue(false);
            entity.Property(e => e.PaymentMethodId).HasColumnName("PaymentMethodID");
            entity.Property(e => e.Provider).HasMaxLength(100);

            entity.HasOne(d => d.Customer).WithMany(p => p.SavedPaymentMethods)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SavedPaym__Custo__65370702");

            entity.HasOne(d => d.PaymentMethod).WithMany(p => p.SavedPaymentMethods)
                .HasForeignKey(d => d.PaymentMethodId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SavedPaym__Payme__662B2B3B");
        });

        modelBuilder.Entity<ShippingDetail>(entity =>
        {
            entity.HasKey(e => e.ShippingId).HasName("PK__Shipping__5FACD46073515E3E");

            entity.Property(e => e.ShippingId).HasColumnName("ShippingID");
            entity.Property(e => e.AddressId).HasColumnName("AddressID");
            entity.Property(e => e.Cost).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.CourierName).HasMaxLength(100);
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.ShipTime).HasMaxLength(10);

            entity.HasOne(d => d.Address).WithMany(p => p.ShippingDetails)
                .HasForeignKey(d => d.AddressId)
                .HasConstraintName("FK__ShippingD__Addre__4B7734FF");

            entity.HasOne(d => d.Order).WithMany(p => p.ShippingDetails)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__ShippingD__Order__4A8310C6");
        });

        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.StaffId).HasName("PK__Staff__96D4AAF76817DB91");

            entity.HasIndex(e => e.Phone, "UQ__Staff__5C7E359EFB94AD78").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Staff__A9D1053494775014").IsUnique();

            entity.Property(e => e.StaffId).HasColumnName("StaffID");
            entity.Property(e => e.Dob).HasColumnName("DOB");
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.Gender)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength();
            entity.Property(e => e.HireDate).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PasswordHash).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.RoleStaff).HasMaxLength(50);
            entity.Property(e => e.StoreId).HasColumnName("StoreID");

            entity.HasOne(d => d.Store).WithMany(p => p.Staff)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK__Staff__StoreID__59063A47");
        });

        modelBuilder.Entity<Store>(entity =>
        {
            entity.HasKey(e => e.StoreId).HasName("PK__Stores__3B82F0E10DA37C4B");

            entity.Property(e => e.StoreId).HasColumnName("StoreID");
            entity.Property(e => e.AddressStore).HasMaxLength(200);
            entity.Property(e => e.DateJoined).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Rating)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(3, 2)");
            entity.Property(e => e.StoreName).HasMaxLength(100);
        });

        modelBuilder.Entity<StoreInventory>(entity =>
        {
            entity.HasKey(e => e.StoreIngredientId).HasName("PK__StoreInv__566F018710553189");

            entity.ToTable("StoreInventory");

            entity.HasIndex(e => new { e.StoreId, e.IngredientId }, "UQ_Store_Ingredient").IsUnique();

            entity.Property(e => e.StoreIngredientId).HasColumnName("StoreIngredientID");
            entity.Property(e => e.IngredientId).HasColumnName("IngredientID");
            entity.Property(e => e.LastUpdated).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.ReorderLevel)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(12, 4)");
            entity.Property(e => e.StockQuantity)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(12, 4)");
            entity.Property(e => e.StoreId).HasColumnName("StoreID");

            entity.HasOne(d => d.Ingredient).WithMany(p => p.StoreInventories)
                .HasForeignKey(d => d.IngredientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StoreInve__Ingre__6383C8BA");

            entity.HasOne(d => d.Store).WithMany(p => p.StoreInventories)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StoreInve__Store__628FA481");
        });

        modelBuilder.Entity<StoreProduct>(entity =>
        {
            entity.HasKey(e => e.StoreProductId).HasName("PK__StorePro__629CD72876FA8A49");

            entity.HasIndex(e => new { e.StoreId, e.ProductId }, "UQ_Store_Product").IsUnique();

            entity.Property(e => e.StoreProductId).HasColumnName("StoreProductID");
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.Stock).HasDefaultValue(0);
            entity.Property(e => e.StoreId).HasColumnName("StoreID");

            entity.HasOne(d => d.Product).WithMany(p => p.StoreProducts)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__StoreProd__Produ__74AE54BC");

            entity.HasOne(d => d.Store).WithMany(p => p.StoreProducts)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK__StoreProd__Store__73BA3083");
        });

        modelBuilder.Entity<UserAction>(entity =>
        {
            entity.HasKey(e => e.ActionId).HasName("PK__UserActi__FFE3F4B9EA0473D3");

            entity.Property(e => e.ActionId).HasColumnName("ActionID");
            entity.Property(e => e.ActionTime)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ActionType).HasMaxLength(50);
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.Metadata).HasMaxLength(500);
            entity.Property(e => e.ProductId).HasColumnName("ProductID");

            entity.HasOne(d => d.Customer).WithMany(p => p.UserActions)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserActio__Custo__078C1F06");

            entity.HasOne(d => d.Product).WithMany(p => p.UserActions)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__UserActio__Produ__0880433F");
        });

        modelBuilder.Entity<UserOtp>(entity =>
        {
            entity.HasKey(e => e.Otpid).HasName("PK__UserOTPs__5C2EC5626A402FCB");

            entity.ToTable("UserOTPs");

            entity.HasIndex(e => new { e.CustomerId, e.Otpcode }, "UQ_Customer_OTP").IsUnique();

            entity.Property(e => e.Otpid).HasColumnName("OTPID");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.ExpiryTime).HasColumnType("datetime");
            entity.Property(e => e.IsUsed).HasDefaultValue(false);
            entity.Property(e => e.Otpcode)
                .HasMaxLength(10)
                .HasColumnName("OTPCode");

            entity.HasOne(d => d.Customer).WithMany(p => p.UserOtps)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserOTPs__Custom__48CFD27E");
        });

        modelBuilder.Entity<UserPreference>(entity =>
        {
            entity.HasKey(e => e.PreferenceId).HasName("PK__UserPref__E228490F1B5C5B38");

            entity.Property(e => e.PreferenceId).HasColumnName("PreferenceID");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.DietaryPreference).HasMaxLength(100);
            entity.Property(e => e.LanguageMode)
                .HasMaxLength(10)
                .HasDefaultValue("vi");
            entity.Property(e => e.LastUpdated)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PreferredCategoryId).HasColumnName("PreferredCategoryID");
            entity.Property(e => e.ThemeMode)
                .HasMaxLength(10)
                .HasDefaultValue("light");

            entity.HasOne(d => d.Customer).WithMany(p => p.UserPreferences)
                .HasForeignKey(d => d.CustomerId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__UserPrefe__Custo__0C50D423");

            entity.HasOne(d => d.PreferredCategory).WithMany(p => p.UserPreferences)
                .HasForeignKey(d => d.PreferredCategoryId)
                .HasConstraintName("FK__UserPrefe__Prefe__0D44F85C");
        });

        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasKey(e => e.VoucherId).HasName("PK__Vouchers__3AEE79C19BF0C87B");

            entity.HasIndex(e => e.Code, "UQ__Vouchers__A25C5AA74F5277F2").IsUnique();

            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");
            entity.Property(e => e.Code).HasMaxLength(50);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DescriptionVou).HasMaxLength(500);
            entity.Property(e => e.DiscountType).HasMaxLength(20);
            entity.Property(e => e.DiscountValue).HasColumnType("decimal(12, 2)");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.IsStackable).HasDefaultValue(false);
            entity.Property(e => e.MaxDiscountAmount).HasColumnType("decimal(12, 2)");
            entity.Property(e => e.MinOrderAmount)
                .HasDefaultValue(0m)
                .HasColumnType("decimal(12, 2)");
            entity.Property(e => e.PerCustomerLimit).HasDefaultValue(1);
            entity.Property(e => e.UsedCount).HasDefaultValue(0);
        });

        modelBuilder.Entity<VoucherCategory>(entity =>
        {
            entity.HasKey(e => e.VoucherCategoryId).HasName("PK__VoucherC__9EED8B15087CCA13");

            entity.HasIndex(e => new { e.VoucherId, e.CategoryId }, "UQ_Voucher_Category").IsUnique();

            entity.Property(e => e.VoucherCategoryId).HasColumnName("VoucherCategoryID");
            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");

            entity.HasOne(d => d.Category).WithMany(p => p.VoucherCategories)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherCa__Categ__31B762FC");

            entity.HasOne(d => d.Voucher).WithMany(p => p.VoucherCategories)
                .HasForeignKey(d => d.VoucherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherCa__Vouch__30C33EC3");
        });

        modelBuilder.Entity<VoucherProduct>(entity =>
        {
            entity.HasKey(e => e.VoucherProductId).HasName("PK__VoucherP__6235909F0AF974B1");

            entity.HasIndex(e => new { e.VoucherId, e.ProductId }, "UQ_Voucher_Product").IsUnique();

            entity.Property(e => e.VoucherProductId).HasColumnName("VoucherProductID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");

            entity.HasOne(d => d.Product).WithMany(p => p.VoucherProducts)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherPr__Produ__2CF2ADDF");

            entity.HasOne(d => d.Voucher).WithMany(p => p.VoucherProducts)
                .HasForeignKey(d => d.VoucherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherPr__Vouch__2BFE89A6");
        });

        modelBuilder.Entity<VoucherRedemption>(entity =>
        {
            entity.HasKey(e => e.RedemptionId).HasName("PK__VoucherR__410680D131899B31");

            entity.HasIndex(e => new { e.VoucherId, e.CustomerId, e.OrderId }, "UQ_Voucher_Customer_Order").IsUnique();

            entity.Property(e => e.RedemptionId).HasColumnName("RedemptionID");
            entity.Property(e => e.Amount).HasColumnType("decimal(12, 2)");
            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.RedeemedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");

            entity.HasOne(d => d.Customer).WithMany(p => p.VoucherRedemptions)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__VoucherRe__Custo__51300E55");

            entity.HasOne(d => d.Order).WithMany(p => p.VoucherRedemptions)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__VoucherRe__Order__503BEA1C");

            entity.HasOne(d => d.Voucher).WithMany(p => p.VoucherRedemptions)
                .HasForeignKey(d => d.VoucherId)
                .HasConstraintName("FK__VoucherRe__Vouch__4F47C5E3");
        });

        modelBuilder.Entity<VoucherStore>(entity =>
        {
            entity.HasKey(e => e.VoucherStoreId).HasName("PK__VoucherS__7931D515A305AC01");

            entity.HasIndex(e => new { e.VoucherId, e.StoreId }, "UQ_Voucher_Store").IsUnique();

            entity.Property(e => e.VoucherStoreId).HasColumnName("VoucherStoreID");
            entity.Property(e => e.StoreId).HasColumnName("StoreID");
            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");

            entity.HasOne(d => d.Store).WithMany(p => p.VoucherStores)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherSt__Store__282DF8C2");

            entity.HasOne(d => d.Voucher).WithMany(p => p.VoucherStores)
                .HasForeignKey(d => d.VoucherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherSt__Vouch__2739D489");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
