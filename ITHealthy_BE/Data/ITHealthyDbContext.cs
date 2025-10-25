﻿using System;
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

    public virtual DbSet<CategoriesIngredient> CategoriesIngredients { get; set; }

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
            entity.HasKey(e => e.BowlId).HasName("PK__Bowls__C923F6C930DD64A8");

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
                .HasConstraintName("FK__Bowls__CustomerI__05D8E0BE");
        });

        modelBuilder.Entity<BowlItem>(entity =>
        {
            entity.HasKey(e => e.BowlItemId).HasName("PK__BowlItem__33A2521F175B42F3");

            entity.HasIndex(e => new { e.BowlId, e.IngredientId }, "UQ_Bowl_Ingredient").IsUnique();

            entity.Property(e => e.BowlItemId).HasColumnName("BowlItemID");
            entity.Property(e => e.BowlId).HasColumnName("BowlID");
            entity.Property(e => e.IngredientId).HasColumnName("IngredientID");
            entity.Property(e => e.Price).HasColumnType("decimal(12, 4)");
            entity.Property(e => e.Quantity).HasColumnType("decimal(12, 4)");

            entity.HasOne(d => d.Bowl).WithMany(p => p.BowlItems)
                .HasForeignKey(d => d.BowlId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BowlItems__BowlI__0A9D95DB");

            entity.HasOne(d => d.Ingredient).WithMany(p => p.BowlItems)
                .HasForeignKey(d => d.IngredientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__BowlItems__Ingre__0B91BA14");
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.CartId).HasName("PK__Carts__51BCD79721C3CFEE");

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
                .HasConstraintName("FK__Carts__CustomerI__58D1301D");

            entity.HasOne(d => d.ReorderFromOrder).WithMany(p => p.Carts)
                .HasForeignKey(d => d.ReorderFromOrderId)
                .HasConstraintName("FK__Carts__ReorderFr__5BAD9CC8");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.CartItemId).HasName("PK__CartItem__488B0B2A818FDDC1");

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
                .HasConstraintName("FK__CartItems__BowlI__6166761E");

            entity.HasOne(d => d.Cart).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.CartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__CartItems__CartI__5E8A0973");

            entity.HasOne(d => d.Combo).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.ComboId)
                .HasConstraintName("FK__CartItems__Combo__607251E5");

            entity.HasOne(d => d.Product).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__CartItems__Produ__5F7E2DAC");
        });

        modelBuilder.Entity<CategoriesIngredient>(entity =>
        {
            entity.HasKey(e => e.CategoriesIngredientsId).HasName("PK__Categori__5917E4CCA70C78D1");

            entity.Property(e => e.CategoriesIngredientsId).HasColumnName("CategoriesIngredientsID");
            entity.Property(e => e.CategoryName).HasMaxLength(100);
            entity.Property(e => e.DescriptionCat).HasMaxLength(255);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A2B7753E1FE");

            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.CategoryName).HasMaxLength(100);
            entity.Property(e => e.DescriptionCat).HasMaxLength(255);
        });

        modelBuilder.Entity<Combo>(entity =>
        {
            entity.HasKey(e => e.ComboId).HasName("PK__Combos__DD42580E01B815A1");

            entity.Property(e => e.ComboId).HasColumnName("ComboID");
            entity.Property(e => e.ComboName).HasMaxLength(100);
            entity.Property(e => e.DescriptionCombo).HasMaxLength(500);
            entity.Property(e => e.ImageCombo).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
        });

        modelBuilder.Entity<ComboItem>(entity =>
        {
            entity.HasKey(e => e.ComboItemId).HasName("PK__ComboIte__EE32F8E547E6E486");

            entity.HasIndex(e => new { e.ComboId, e.ProductId }, "UQ_Combo_Product").IsUnique();

            entity.Property(e => e.ComboItemId).HasColumnName("ComboItemID");
            entity.Property(e => e.ComboId).HasColumnName("ComboID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.Quantity).HasDefaultValue(1);

            entity.HasOne(d => d.Combo).WithMany(p => p.ComboItems)
                .HasForeignKey(d => d.ComboId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ComboItem__Combo__01142BA1");

            entity.HasOne(d => d.Product).WithMany(p => p.ComboItems)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ComboItem__Produ__02084FDA");
        });

        modelBuilder.Entity<CourierService>(entity =>
        {
            entity.HasKey(e => e.CourierId).HasName("PK__CourierS__CDAE76F6A9130273");

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
            entity.HasKey(e => e.CustomerId).HasName("PK__Customer__A4AE64B88A3D63C7");

            entity.HasIndex(e => e.Phone, "UQ__Customer__5C7E359E1BCD325B").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Customer__A9D105346C96CB8E").IsUnique();

            entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
            entity.Property(e => e.Avatar).HasMaxLength(255);
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
            entity.Property(e => e.IsActive).HasDefaultValue(false);
            entity.Property(e => e.PasswordHash).HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(15);
            entity.Property(e => e.RoleUser).HasMaxLength(50);
        });

        modelBuilder.Entity<CustomerAddress>(entity =>
        {
            entity.HasKey(e => e.AddressId).HasName("PK__Customer__091C2A1B1D49AB18");

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
                .HasConstraintName("FK__CustomerA__Custo__403A8C7D");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__6A4BEDF69AA5A063");

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
                .HasConstraintName("FK__Feedbacks__Combo__73852659");

            entity.HasOne(d => d.Customer).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__Feedbacks__Custo__719CDDE7");

            entity.HasOne(d => d.Product).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__Feedbacks__Produ__72910220");
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.IngredientId).HasName("PK__Ingredie__BEAEB27A6C94A4CA");

            entity.Property(e => e.IngredientId).HasColumnName("IngredientID");
            entity.Property(e => e.BasePrice).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Calories).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Carbs).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.CategoriesIngredientsId).HasColumnName("CategoriesIngredientsID");
            entity.Property(e => e.Fat).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.IngredientName).HasMaxLength(100);
            entity.Property(e => e.Protein).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Unit).HasMaxLength(20);

            entity.HasOne(d => d.CategoriesIngredients).WithMany(p => p.Ingredients)
                .HasForeignKey(d => d.CategoriesIngredientsId)
                .HasConstraintName("FK__Ingredien__Categ__628FA481");
        });

        modelBuilder.Entity<InventoryTransaction>(entity =>
        {
            entity.HasKey(e => e.InventoryTransactionId).HasName("PK__Inventor__0863F8685DCF8A14");

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
                .HasConstraintName("FK__Inventory__Ingre__03BB8E22");

            entity.HasOne(d => d.Store).WithMany(p => p.InventoryTransactions)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Inventory__Store__02C769E9");
        });

        modelBuilder.Entity<LoginHistory>(entity =>
        {
            entity.HasKey(e => e.LoginId).HasName("PK__LoginHis__4DDA28386A8D7A7F");

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
                .HasConstraintName("FK__LoginHist__Custo__4E88ABD4");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Orders__C3905BAF041ADD04");

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
                .HasConstraintName("FK__Orders__Customer__3864608B");

            entity.HasOne(d => d.Promotion).WithMany(p => p.Orders)
                .HasForeignKey(d => d.PromotionId)
                .HasConstraintName("FK__Orders__Promotio__3B40CD36");

            entity.HasOne(d => d.Store).WithMany(p => p.Orders)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK__Orders__StoreID__395884C4");

            entity.HasOne(d => d.Voucher).WithMany(p => p.Orders)
                .HasForeignKey(d => d.VoucherId)
                .HasConstraintName("FK__Orders__VoucherI__3A4CA8FD");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.OrderItemId).HasName("PK__OrderIte__57ED06A1398C9EA5");

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
                .HasConstraintName("FK__OrderItem__BowlI__44CA3770");

            entity.HasOne(d => d.Combo).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ComboId)
                .HasConstraintName("FK__OrderItem__Combo__43D61337");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__OrderItem__Order__41EDCAC5");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__OrderItem__Produ__42E1EEFE");
        });

        modelBuilder.Entity<OrderItemIngredient>(entity =>
        {
            entity.HasKey(e => e.OrderItemIngredientId).HasName("PK__OrderIte__6DC447D5F8C26D37");

            entity.Property(e => e.OrderItemIngredientId).HasColumnName("OrderItemIngredientID");
            entity.Property(e => e.IngredientId).HasColumnName("IngredientID");
            entity.Property(e => e.OrderItemId).HasColumnName("OrderItemID");
            entity.Property(e => e.Quantity).HasColumnType("decimal(12, 4)");

            entity.HasOne(d => d.Ingredient).WithMany(p => p.OrderItemIngredients)
                .HasForeignKey(d => d.IngredientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderItem__Ingre__0880433F");

            entity.HasOne(d => d.OrderItem).WithMany(p => p.OrderItemIngredients)
                .HasForeignKey(d => d.OrderItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__OrderItem__Order__078C1F06");
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__Payments__9B556A582FBC8A4B");

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
                .HasConstraintName("FK__Payments__OrderI__489AC854");
        });

        modelBuilder.Entity<PaymentMethod>(entity =>
        {
            entity.HasKey(e => e.PaymentMethodId).HasName("PK__PaymentM__DC31C1F31C7620A8");

            entity.Property(e => e.PaymentMethodId).HasColumnName("PaymentMethodID");
            entity.Property(e => e.DescriptionPayMethod).HasMaxLength(255);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.MethodName).HasMaxLength(50);
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Products__B40CC6EDAA9445AC");

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
                .HasConstraintName("FK__Products__Catego__6D0D32F4");
        });

        modelBuilder.Entity<ProductIngredient>(entity =>
        {
            entity.HasKey(e => e.ProductIngredientId).HasName("PK__ProductI__0748070461153608");

            entity.HasIndex(e => new { e.ProductId, e.IngredientId }, "UQ_Product_Ingredient").IsUnique();

            entity.Property(e => e.ProductIngredientId).HasColumnName("ProductIngredientID");
            entity.Property(e => e.IngredientId).HasColumnName("IngredientID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.Quantity).HasColumnType("decimal(12, 4)");

            entity.HasOne(d => d.Ingredient).WithMany(p => p.ProductIngredients)
                .HasForeignKey(d => d.IngredientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ProductIn__Ingre__73BA3083");

            entity.HasOne(d => d.Product).WithMany(p => p.ProductIngredients)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ProductIn__Produ__72C60C4A");
        });

        modelBuilder.Entity<ProductPriceHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId).HasName("PK__ProductP__4D7B4ADD152A242E");

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
                .HasConstraintName("FK__ProductPr__Store__7EF6D905");
        });

        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasKey(e => e.PromotionId).HasName("PK__Promotio__52C42F2F2377D7CF");

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
            entity.HasKey(e => e.PromotionCategoryId).HasName("PK__Promotio__0D44A889B9062C97");

            entity.HasIndex(e => new { e.PromotionId, e.CategoryId }, "UQ_Promotion_Category").IsUnique();

            entity.Property(e => e.PromotionCategoryId).HasColumnName("PromotionCategoryID");
            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.PromotionId).HasColumnName("PromotionID");

            entity.HasOne(d => d.Category).WithMany(p => p.PromotionCategories)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Categ__1EA48E88");

            entity.HasOne(d => d.Promotion).WithMany(p => p.PromotionCategories)
                .HasForeignKey(d => d.PromotionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Promo__1DB06A4F");
        });

        modelBuilder.Entity<PromotionProduct>(entity =>
        {
            entity.HasKey(e => e.PromotionProductId).HasName("PK__Promotio__C7B85D3CDBFE28DC");

            entity.HasIndex(e => new { e.PromotionId, e.ProductId }, "UQ_Promotion_Product").IsUnique();

            entity.Property(e => e.PromotionProductId).HasColumnName("PromotionProductID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.PromotionId).HasColumnName("PromotionID");

            entity.HasOne(d => d.Product).WithMany(p => p.PromotionProducts)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Produ__19DFD96B");

            entity.HasOne(d => d.Promotion).WithMany(p => p.PromotionProducts)
                .HasForeignKey(d => d.PromotionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Promo__18EBB532");
        });

        modelBuilder.Entity<PromotionStore>(entity =>
        {
            entity.HasKey(e => e.PromotionStoreId).HasName("PK__Promotio__E040054E79622FFE");

            entity.HasIndex(e => new { e.PromotionId, e.StoreId }, "UQ_Promotion_Store").IsUnique();

            entity.Property(e => e.PromotionStoreId).HasColumnName("PromotionStoreID");
            entity.Property(e => e.PromotionId).HasColumnName("PromotionID");
            entity.Property(e => e.StoreId).HasColumnName("StoreID");

            entity.HasOne(d => d.Promotion).WithMany(p => p.PromotionStores)
                .HasForeignKey(d => d.PromotionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Promo__14270015");

            entity.HasOne(d => d.Store).WithMany(p => p.PromotionStores)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Promotion__Store__151B244E");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__RefreshT__3214EC070F040F4F");

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
                .HasConstraintName("FK__RefreshTo__Custo__3D5E1FD2");
        });

        modelBuilder.Entity<Revenue>(entity =>
        {
            entity.HasKey(e => e.RevenueId).HasName("PK__Revenue__275F173D589A4E4D");

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
                .HasConstraintName("FK__Revenue__StoreID__793DFFAF");
        });

        modelBuilder.Entity<SavedPaymentMethod>(entity =>
        {
            entity.HasKey(e => e.SavedPaymentId).HasName("PK__SavedPay__446C8635E35AF46C");

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
                .HasConstraintName("FK__SavedPaym__Custo__690797E6");

            entity.HasOne(d => d.PaymentMethod).WithMany(p => p.SavedPaymentMethods)
                .HasForeignKey(d => d.PaymentMethodId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__SavedPaym__Payme__69FBBC1F");
        });

        modelBuilder.Entity<ShippingDetail>(entity =>
        {
            entity.HasKey(e => e.ShippingId).HasName("PK__Shipping__5FACD4605A45A54E");

            entity.Property(e => e.ShippingId).HasColumnName("ShippingID");
            entity.Property(e => e.AddressId).HasColumnName("AddressID");
            entity.Property(e => e.Cost).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.CourierName).HasMaxLength(100);
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.ShipTime).HasMaxLength(10);

            entity.HasOne(d => d.Address).WithMany(p => p.ShippingDetails)
                .HasForeignKey(d => d.AddressId)
                .HasConstraintName("FK__ShippingD__Addre__4F47C5E3");

            entity.HasOne(d => d.Order).WithMany(p => p.ShippingDetails)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__ShippingD__Order__4E53A1AA");
        });

        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.StaffId).HasName("PK__Staff__96D4AAF7FD91C8D7");

            entity.HasIndex(e => e.Phone, "UQ__Staff__5C7E359EDB7A996D").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Staff__A9D1053493A408C1").IsUnique();

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
                .HasConstraintName("FK__Staff__StoreID__59FA5E80");
        });

        modelBuilder.Entity<Store>(entity =>
        {
            entity.HasKey(e => e.StoreId).HasName("PK__Stores__3B82F0E15C3734FF");

            entity.Property(e => e.StoreId).HasColumnName("StoreID");
            // Địa chỉ chi tiết
            entity.Property(e => e.StreetAddress)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(e => e.Ward)
                .HasMaxLength(100);

            entity.Property(e => e.District)
                .HasMaxLength(100);

            entity.Property(e => e.City)
                .HasMaxLength(100);

            entity.Property(e => e.Country)
                .HasMaxLength(100)
                .HasDefaultValue("Việt Nam");

            entity.Property(e => e.Postcode)
                .HasMaxLength(10);

            // Bản đồ / vị trí
            entity.Property(e => e.Latitude)
                .HasColumnType("decimal(9, 6)");

            entity.Property(e => e.Longitude)
                .HasColumnType("decimal(9, 6)");

            entity.Property(e => e.GooglePlaceId)
                .HasMaxLength(255)
                .HasColumnName("GooglePlaceID");
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
            entity.HasKey(e => e.StoreIngredientId).HasName("PK__StoreInv__566F01877FFDAED8");

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
                .HasConstraintName("FK__StoreInve__Ingre__6754599E");

            entity.HasOne(d => d.Store).WithMany(p => p.StoreInventories)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__StoreInve__Store__66603565");
        });

        modelBuilder.Entity<StoreProduct>(entity =>
        {
            entity.HasKey(e => e.StoreProductId).HasName("PK__StorePro__629CD7283909A3F5");

            entity.HasIndex(e => new { e.StoreId, e.ProductId }, "UQ_Store_Product").IsUnique();

            entity.Property(e => e.StoreProductId).HasColumnName("StoreProductID");
            entity.Property(e => e.IsAvailable).HasDefaultValue(true);
            entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.Stock).HasDefaultValue(0);
            entity.Property(e => e.StoreId).HasColumnName("StoreID");

            entity.HasOne(d => d.Product).WithMany(p => p.StoreProducts)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__StoreProd__Produ__787EE5A0");

            entity.HasOne(d => d.Store).WithMany(p => p.StoreProducts)
                .HasForeignKey(d => d.StoreId)
                .HasConstraintName("FK__StoreProd__Store__778AC167");
        });

        modelBuilder.Entity<UserAction>(entity =>
        {
            entity.HasKey(e => e.ActionId).HasName("PK__UserActi__FFE3F4B94FEAF597");

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
                .HasConstraintName("FK__UserActio__Custo__0B5CAFEA");

            entity.HasOne(d => d.Product).WithMany(p => p.UserActions)
                .HasForeignKey(d => d.ProductId)
                .HasConstraintName("FK__UserActio__Produ__0C50D423");
        });

        modelBuilder.Entity<UserOtp>(entity =>
        {
            entity.HasKey(e => e.Otpid).HasName("PK__UserOTPs__5C2EC562739AAF4E");

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
                .HasConstraintName("FK__UserOTPs__Custom__49C3F6B7");
        });

        modelBuilder.Entity<UserPreference>(entity =>
        {
            entity.HasKey(e => e.PreferenceId).HasName("PK__UserPref__E228490FF43B490A");

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
                .HasConstraintName("FK__UserPrefe__Custo__10216507");

            entity.HasOne(d => d.PreferredCategory).WithMany(p => p.UserPreferences)
                .HasForeignKey(d => d.PreferredCategoryId)
                .HasConstraintName("FK__UserPrefe__Prefe__11158940");
        });

        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasKey(e => e.VoucherId).HasName("PK__Vouchers__3AEE79C13720B5BF");

            entity.HasIndex(e => e.Code, "UQ__Vouchers__A25C5AA7D3CBDD16").IsUnique();

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
            entity.HasKey(e => e.VoucherCategoryId).HasName("PK__VoucherC__9EED8B15BB3E2773");

            entity.HasIndex(e => new { e.VoucherId, e.CategoryId }, "UQ_Voucher_Category").IsUnique();

            entity.Property(e => e.VoucherCategoryId).HasColumnName("VoucherCategoryID");
            entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");

            entity.HasOne(d => d.Category).WithMany(p => p.VoucherCategories)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherCa__Categ__3587F3E0");

            entity.HasOne(d => d.Voucher).WithMany(p => p.VoucherCategories)
                .HasForeignKey(d => d.VoucherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherCa__Vouch__3493CFA7");
        });

        modelBuilder.Entity<VoucherProduct>(entity =>
        {
            entity.HasKey(e => e.VoucherProductId).HasName("PK__VoucherP__6235909FBA2CD382");

            entity.HasIndex(e => new { e.VoucherId, e.ProductId }, "UQ_Voucher_Product").IsUnique();

            entity.Property(e => e.VoucherProductId).HasColumnName("VoucherProductID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");

            entity.HasOne(d => d.Product).WithMany(p => p.VoucherProducts)
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherPr__Produ__30C33EC3");

            entity.HasOne(d => d.Voucher).WithMany(p => p.VoucherProducts)
                .HasForeignKey(d => d.VoucherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherPr__Vouch__2FCF1A8A");
        });

        modelBuilder.Entity<VoucherRedemption>(entity =>
        {
            entity.HasKey(e => e.RedemptionId).HasName("PK__VoucherR__410680D1A2FB513B");

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
                .HasConstraintName("FK__VoucherRe__Custo__55009F39");

            entity.HasOne(d => d.Order).WithMany(p => p.VoucherRedemptions)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__VoucherRe__Order__540C7B00");

            entity.HasOne(d => d.Voucher).WithMany(p => p.VoucherRedemptions)
                .HasForeignKey(d => d.VoucherId)
                .HasConstraintName("FK__VoucherRe__Vouch__531856C7");
        });

        modelBuilder.Entity<VoucherStore>(entity =>
        {
            entity.HasKey(e => e.VoucherStoreId).HasName("PK__VoucherS__7931D515CCDB6C44");

            entity.HasIndex(e => new { e.VoucherId, e.StoreId }, "UQ_Voucher_Store").IsUnique();

            entity.Property(e => e.VoucherStoreId).HasColumnName("VoucherStoreID");
            entity.Property(e => e.StoreId).HasColumnName("StoreID");
            entity.Property(e => e.VoucherId).HasColumnName("VoucherID");

            entity.HasOne(d => d.Store).WithMany(p => p.VoucherStores)
                .HasForeignKey(d => d.StoreId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherSt__Store__2BFE89A6");

            entity.HasOne(d => d.Voucher).WithMany(p => p.VoucherStores)
                .HasForeignKey(d => d.VoucherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__VoucherSt__Vouch__2B0A656D");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
