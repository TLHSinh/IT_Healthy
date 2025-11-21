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
        private readonly IMomoService _momoService;

        public CheckoutController(ITHealthyDbContext context, IMomoService momoService)
        {
            _context = context;
            _momoService = momoService;
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
                var totalPrice = request.Items.Sum(i => i.UnitPrice * i.Quantity);
                var discount = request.Discount ?? 0;
                var finalPrice = totalPrice - discount;

                var order = new Order
                {
                    CustomerId = request.CustomerId,
                    StoreId = request.StoreId,
                    VoucherId = request.VoucherId,
                    PromotionId = request.PromotionId,
                    OrderDate = DateTime.UtcNow,
                    TotalPrice = totalPrice,
                    DiscountApplied = discount,
                    FinalPrice = finalPrice,
                    StatusOrder = "Pending",
                    InventoryDeducted = false,
                    OrderNote = request.OrderNote,
                    OrderType = request.OrderType
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                var payment = new Payment
                {
                    OrderId = order.OrderId,
                    PaymentDate = DateTime.UtcNow,
                    PaymentMethod = request.PaymentMethod, // "COD" or "MOMO"
                    Amount = order.FinalPrice,
                    Status = "Pending"
                };
                _context.Payments.Add(payment);
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

                    // Trừ kho nguyên liệu
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

                await _context.SaveChangesAsync();

                if (request.PaymentMethod == "COD")
                {
                    // COD: trừ kho + xóa cart ngay
                    var invResult = await DeductInventoryForOrder(order.OrderId, request.StoreId);
                    if (!invResult.IsSuccess)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(invResult.ErrorMessage);
                    }

                    await RemoveCartItemsForOrder(order.OrderId, request.CustomerId);
                    order.InventoryDeducted = true;
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();
                    return Ok(new { orderId = order.OrderId, message = "Checkout successful (COD)." });
                }


                else if (request.PaymentMethod == "MOMO")
                {
                    // MOMO: tạo payment link, KHÔNG trừ kho, KHÔNG xóa cart
                    var description = $"Thanh toán đơn hàng {order.OrderId}";
                    var extraData = order.OrderId.ToString(); // để IPN quay về nhận diện

                    var momoResponse = await _momoService.CreatePaymentAsync(
                        order.OrderId,
                        order.FinalPrice ?? 0,
                        description,
                        extraData
                    );

                    // Gợi ý: lưu momoOrderId && requestId vào Payment
                    payment.Status = "Pending";
                    // Bạn có thể thêm cột vào Payment:
                    // payment.MomoOrderId = momoResponse.orderId;
                    // payment.MomoRequestId = momoResponse.requestId;
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();


                    return Ok(new
                    {
                        orderId = order.OrderId,
                        payUrl = momoResponse.payUrl,
                        deeplink = momoResponse.deeplink,
                        message = "Order created. Redirect to MoMo."
                    });
                }
                else
                {
                    await transaction.RollbackAsync();
                    return BadRequest("Unsupported payment method.");
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Checkout failed: {ex.Message}");

            }
        }

        //Helper trừ kho xoá giỏ hàng
        private async Task<OperationResult> DeductInventoryForOrder(int orderId, int storeId)
        {
            var orderItems = await _context.OrderItems
                .Where(oi => oi.OrderId == orderId && oi.ProductId.HasValue)
                .ToListAsync();

            foreach (var orderItem in orderItems)
            {
                var productIngredients = await _context.ProductIngredients
                    .Where(pi => pi.ProductId == orderItem.ProductId.Value)
                    .ToListAsync();

                foreach (var pi in productIngredients)
                {
                    var storeInventory = await _context.StoreInventories
                        .FirstOrDefaultAsync(si => si.StoreId == storeId && si.IngredientId == pi.IngredientId);

                    if (storeInventory == null)
                        return OperationResult.Fail($"Ingredient {pi.IngredientId} not found in store inventory.");

                    decimal totalUsed = Math.Round(pi.Quantity * orderItem.Quantity, 2);
                    decimal epsilon = 0.0001M;

                    if ((storeInventory.StockQuantity ?? 0) + epsilon < totalUsed)
                    {
                        var ingredientName = pi.Ingredient?.IngredientName ?? pi.IngredientId.ToString();
                        return OperationResult.Fail($"Not enough stock for ingredient {ingredientName}.");
                    }

                    storeInventory.StockQuantity -= totalUsed;
                    storeInventory.LastUpdated = DateTime.UtcNow;

                    var orderItemIngredient = new OrderItemIngredient
                    {
                        OrderItemId = orderItem.OrderItemId,
                        IngredientId = pi.IngredientId,
                        Quantity = totalUsed
                    };
                    _context.OrderItemIngredients.Add(orderItemIngredient);
                }
            }

            await _context.SaveChangesAsync();
            return OperationResult.Success();
        }

        private async Task RemoveCartItemsForOrder(int orderId, int? customerId)
        {
            if (!customerId.HasValue) return;

            var orderItems = await _context.OrderItems
                .Where(oi => oi.OrderId == orderId)
                .ToListAsync();

            var productIds = orderItems.Where(oi => oi.ProductId.HasValue)
                .Select(oi => oi.ProductId!.Value).Distinct().ToList();
            var comboIds = orderItems.Where(oi => oi.ComboId.HasValue)
                .Select(oi => oi.ComboId!.Value).Distinct().ToList();
            var bowlIds = orderItems.Where(oi => oi.BowlId.HasValue)
                .Select(oi => oi.BowlId!.Value).Distinct().ToList();

            var cartItemsToRemove = await _context.CartItems
                .Where(ci => ci.Cart.CustomerId == customerId.Value &&
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
        }



        [HttpPost("confirm-order")]
        public async Task<IActionResult> ConfirmOrderAfterReturn([FromBody] ConfirmOrderRequest request)
        {
            if (request == null || request.OrderId <= 0 || request.CartId <= 0)
                return BadRequest("orderId or cartId is missing.");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .Include(o => o.Payments)
                    .FirstOrDefaultAsync(o => o.OrderId == request.OrderId);

                if (order == null)
                    return NotFound("Order not found.");

                // 🔥 1. Trừ kho nếu chưa trừ
                if (order.InventoryDeducted != true)
                {
                    foreach (var item in order.OrderItems)
                    {
                        if (item.ProductId.HasValue)
                        {
                            var ingredients = await _context.ProductIngredients
                                .Where(pi => pi.ProductId == item.ProductId.Value)
                                .ToListAsync();

                            foreach (var pi in ingredients)
                            {
                                var inventory = await _context.StoreInventories
                                    .FirstOrDefaultAsync(si =>
                                        si.StoreId == order.StoreId &&
                                        si.IngredientId == pi.IngredientId);

                                if (inventory == null)
                                    return BadRequest($"Ingredient {pi.IngredientId} not found.");

                                decimal used = Math.Round(pi.Quantity * item.Quantity, 2);
                                decimal epsilon = 0.0001M;

                                if ((inventory.StockQuantity ?? 0) + epsilon < used)
                                    return BadRequest($"Not enough stock for ingredient {pi.IngredientId}");

                                inventory.StockQuantity -= used;
                                inventory.LastUpdated = DateTime.UtcNow;

                                _context.OrderItemIngredients.Add(new OrderItemIngredient
                                {
                                    OrderItemId = item.OrderItemId,
                                    IngredientId = pi.IngredientId,
                                    Quantity = used
                                });
                            }
                        }
                    }

                    order.InventoryDeducted = true;
                }

                // 🔥 2. Xoá đúng giỏ hàng được gửi lên (cartId)
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .FirstOrDefaultAsync(c => c.CartId == request.CartId);

                if (cart != null)
                {
                    _context.CartItems.RemoveRange(cart.CartItems);
                    _context.Carts.Remove(cart);
                }

                // 🔥 3. Update Payment = Success
                foreach (var pay in order.Payments)
                {
                    pay.Status = "Paid";
                    pay.PaymentDate = DateTime.UtcNow;
                }

                // 🔥 4. Update Order Status = Completed
                order.StatusOrder = "Pending";

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { message = "Order confirmed, inventory updated, cart removed, payment successful." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, ex.Message);
            }
        }


    }

}


