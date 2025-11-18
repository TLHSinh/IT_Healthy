using ITHealthy.Data;
using ITHealthy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckoutController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public CheckoutController(ITHealthyDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
        {
            if (request == null || request.Items == null || !request.Items.Any())
                return BadRequest("Invalid checkout request.");

            if (string.IsNullOrWhiteSpace(request.OrderType) ||
                !(request.OrderType == "Shipping" || request.OrderType == "Pickup"))
                return BadRequest("OrderType must be either 'Shipping' or 'Pickup'.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Tạo Order mới
                var order = new Order
                {
                    CustomerId = request.CustomerId,
                    StoreId = request.StoreId,
                    VoucherId = request.VoucherId,
                    PromotionId = request.PromotionId,
                    OrderDate = DateTime.UtcNow,
                    TotalPrice = request.Items.Sum(i => i.UnitPrice * i.Quantity),
                    DiscountApplied = request.Discount ?? 0,
                    FinalPrice = request.Items.Sum(i => i.UnitPrice * i.Quantity) - (request.Discount ?? 0),
                    StatusOrder = "Pending",
                    InventoryDeducted = false,
                    OrderNote = request.OrderNote,           // lưu ghi chú
                    OrderType = request.OrderType           // lưu loại đơn hàng
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // 2. Tạo OrderItem và trừ kho nguyên liệu
                foreach (var item in request.Items)
                {
                    var orderItem = new OrderItem
                    {
                        OrderId = order.OrderId,
                        ProductId = item.ProductId,
                        ComboId = item.ComboId,
                        BowlId = item.BowlId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice,
                        TotalPrice = item.UnitPrice * item.Quantity
                    };
                    _context.OrderItems.Add(orderItem);

                    // 3. Trừ kho nguyên liệu nếu có ProductId
                    if (item.ProductId.HasValue)
                    {
                        var productIngredients = await _context.ProductIngredients
                            .Where(pi => pi.ProductId == item.ProductId.Value)
                            .ToListAsync();

                        foreach (var pi in productIngredients)
                        {
                            var storeInventory = await _context.StoreInventories
                                .FirstOrDefaultAsync(si => si.StoreId == request.StoreId && si.IngredientId == pi.IngredientId);

                            if (storeInventory == null)
                                return BadRequest($"Ingredient {pi.IngredientId} not found in store inventory.");

                            decimal totalUsed = Math.Round(pi.Quantity * item.Quantity, 2);
                            decimal epsilon = 0.0001M;
                            if ((storeInventory.StockQuantity ?? 0) + epsilon < totalUsed)
                                return BadRequest($"Not enough stock for ingredient {pi.Ingredient?.IngredientName ?? pi.IngredientId.ToString()}.");

                            storeInventory.StockQuantity -= totalUsed;
                            storeInventory.LastUpdated = DateTime.UtcNow;

                            // Thêm OrderItemIngredient
                            var orderItemIngredient = new OrderItemIngredient
                            {
                                OrderItem = orderItem,
                                IngredientId = pi.IngredientId,
                                Quantity = totalUsed
                            };
                            _context.Add(orderItemIngredient);
                        }
                    }
                }

                // 4. Nếu OrderType = Shipping thì lưu ShippingDetails
                if (order.OrderType == "Shipping" && request.ShippingAddressId.HasValue)
                {
                    var shippingDetail = new ShippingDetail
                    {
                        OrderId = order.OrderId,
                        AddressId = request.ShippingAddressId.Value,
                        CourierName = request.CourierName,
                        ShipDate = request.ShipDate,
                        ShipTime = request.ShipTime,
                        Cost = request.ShippingCost
                    };
                    _context.ShippingDetails.Add(shippingDetail);
                }

                // 5. Xóa CartItems đã checkout
                var productIds = request.Items
                    .Where(i => i.ProductId.HasValue)
                    .Select(i => i.ProductId!.Value)
                    .ToList();

                var comboIds = request.Items
                    .Where(i => i.ComboId.HasValue)
                    .Select(i => i.ComboId!.Value)
                    .ToList();

                var bowlIds = request.Items
                    .Where(i => i.BowlId.HasValue)
                    .Select(i => i.BowlId!.Value)
                    .ToList();

                var cartItemsToRemove = await _context.CartItems
                    .Where(ci => ci.Cart.CustomerId == request.CustomerId &&
                                 ((ci.ProductId.HasValue && productIds.Contains(ci.ProductId.Value)) ||
                                  (ci.ComboId.HasValue && comboIds.Contains(ci.ComboId.Value)) ||
                                  (ci.BowlId.HasValue && bowlIds.Contains(ci.BowlId.Value))))
                    .ToListAsync();

                _context.CartItems.RemoveRange(cartItemsToRemove);

                var cartIds = cartItemsToRemove.Select(ci => ci.CartId).Distinct();
                var emptyCarts = await _context.Carts
                    .Where(c => cartIds.Contains(c.CartId) && !c.CartItems.Any())
                    .ToListAsync();
                _context.Carts.RemoveRange(emptyCarts);

                await _context.SaveChangesAsync();

                // 6. Đánh dấu inventory đã trừ
                order.InventoryDeducted = true;
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { orderId = order.OrderId, message = "Checkout successful and inventory updated." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Checkout failed: {ex.Message}");
            }
        }
    }


}