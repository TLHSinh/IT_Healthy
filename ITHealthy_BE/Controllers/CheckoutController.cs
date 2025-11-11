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
                    StatusOrder = "Paid",
                    InventoryDeducted = false
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
                            // Lấy tồn kho tương ứng của cửa hàng
                            var storeInventory = await _context.StoreInventories
                                .FirstOrDefaultAsync(si => si.StoreId == request.StoreId && si.IngredientId == pi.IngredientId);
                            Console.WriteLine($"kiểm tra StoreInventory: {storeInventory?.StockQuantity}, StoreId={storeInventory?.StoreId}, IngredientId={storeInventory?.IngredientId}");

                            if (storeInventory == null)
                                return BadRequest($"Ingredient {pi.IngredientId} not found in store inventory.");

                            decimal totalUsed = Math.Round(pi.Quantity * item.Quantity, 2);
                            Console.WriteLine($"Kiểm tra totalUsed IngredientId={pi.IngredientId}, Stock={storeInventory.StockQuantity}, totalUsed={totalUsed}");


                            decimal epsilon = 0.0001M;
                            if ((storeInventory.StockQuantity ?? 0) + epsilon < totalUsed)
                                return BadRequest($"Not enough stock for ingredient & stock={storeInventory.StockQuantity},{pi.Ingredient?.IngredientName ?? pi.IngredientId.ToString()}.");

                            storeInventory.StockQuantity -= totalUsed;
                            storeInventory.LastUpdated = DateTime.UtcNow;

                            // Thêm OrderItemIngredient record nếu cần
                            var orderItemIngredient = new OrderItemIngredient
                            {
                                OrderItem = orderItem,
                                IngredientId = pi.IngredientId,
                                Quantity = totalUsed
                            };
                            _context.Add(orderItemIngredient);


                            // Lấy danh sách ProductId đã checkout từ request
                            var productIds = request.Items
                                .Where(i => i.ProductId.HasValue)
                                .Select(i => i.ProductId.Value)
                                .ToList();

                            // Truy vấn CartItems
                            var cartItemsToRemove = await _context.CartItems
                                .Where(ci => ci.Cart.CustomerId == request.CustomerId &&
                                             ci.ProductId.HasValue &&
                                             productIds.Contains(ci.ProductId.Value))
                                .ToListAsync();

                            // Xóa các item này
                            // Xóa CartItem đã checkout
                            _context.CartItems.RemoveRange(cartItemsToRemove);
                            await _context.SaveChangesAsync();

                            // Xóa Cart nếu không còn item nào
                            var cartIds = cartItemsToRemove.Select(ci => ci.CartId).Distinct();

                            var emptyCarts = await _context.Carts
                                .Where(c => cartIds.Contains(c.CartId) && !c.CartItems.Any())
                                .ToListAsync();

                            _context.Carts.RemoveRange(emptyCarts);
                            await _context.SaveChangesAsync();


                        }
                    }
                }

                // 4. Lưu tất cả thay đổi
                await _context.SaveChangesAsync();

                // 5. Đánh dấu inventory đã trừ
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