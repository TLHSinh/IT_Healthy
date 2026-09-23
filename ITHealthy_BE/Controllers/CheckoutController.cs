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
        private const string OrderTypeShipping = "Shipping";
        private const string OrderTypePickup = "Pickup";
        private const string PaymentMethodCod = "COD";
        private const string PaymentMethodMomo = "MOMO";

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

            var orderType = NormalizeOrderType(request.OrderType);
            if (orderType == null)
                return BadRequest("OrderType must be either 'Shipping' or 'Pickup'.");

            var paymentMethod = NormalizePaymentMethod(request.PaymentMethod);
            if (paymentMethod == null)
                return BadRequest("PaymentMethod must be either 'COD' or 'MOMO'.");

            var itemValidation = ValidateCheckoutItems(request.Items);
            if (!itemValidation.IsSuccess)
                return BadRequest(itemValidation.ErrorMessage);

            if (orderType == OrderTypeShipping && !request.ShippingAddressId.HasValue)
                return BadRequest("ShippingAddressId is required for shipping orders.");

            var totalPrice = request.Items.Sum(i => i.UnitPrice * i.Quantity);
            var shippingCost =
                orderType == OrderTypeShipping
                    ? Math.Max(request.ShippingCost ?? 0, 0)
                    : 0;
            var discount = Math.Max(request.Discount ?? 0, 0);
            var finalPrice = Math.Max(totalPrice + shippingCost - discount, 0);

            if (finalPrice <= 0)
                return BadRequest("FinalPrice must be greater than 0.");

            Order order = null!;
            Payment payment = null!;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                order = new Order
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
                    OrderType = orderType
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                payment = new Payment
                {
                    OrderId = order.OrderId,
                    PaymentDate = DateTime.UtcNow,
                    PaymentMethod = paymentMethod,
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
                        Cost = shippingCost
                    };
                    _context.ShippingDetails.Add(shippingDetail);
                }

                await _context.SaveChangesAsync();

                if (paymentMethod == PaymentMethodCod)
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


                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Checkout failed: {ex.Message}");
            }

            if (paymentMethod == PaymentMethodMomo)
            {
                try
                {
                    // MOMO: tạo payment link sau khi đơn đã được lưu, KHÔNG trừ kho, KHÔNG xóa cart
                    var description = $"Thanh toán đơn hàng {order.OrderId}";
                    var extraData = order.OrderId.ToString(); // để IPN quay về nhận diện

                    var momoResponse = await _momoService.CreatePaymentAsync(
                        order.OrderId,
                        order.FinalPrice ?? 0,
                        description,
                        extraData
                    );

                    payment.Status = "Pending";
                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        orderId = order.OrderId,
                        payUrl = momoResponse.payUrl,
                        deeplink = momoResponse.deeplink,
                        message = "Order created. Redirect to MoMo."
                    });
                }
                catch (Exception ex)
                {
                    payment.Status = "Failed";
                    payment.PaymentDate = DateTime.UtcNow;
                    order.StatusOrder = "Cancelled";
                    await _context.SaveChangesAsync();

                    return StatusCode(502, new
                    {
                        orderId = order.OrderId,
                        message = "Cannot create MoMo payment.",
                        detail = ex.Message
                    });
                }
            }

            return BadRequest("Unsupported payment method.");
        }

        private static string? NormalizeOrderType(string? orderType)
        {
            if (string.IsNullOrWhiteSpace(orderType))
                return null;

            return orderType.Trim().ToLowerInvariant() switch
            {
                "shipping" => OrderTypeShipping,
                "pickup" => OrderTypePickup,
                _ => null
            };
        }

        private static string? NormalizePaymentMethod(string? paymentMethod)
        {
            if (string.IsNullOrWhiteSpace(paymentMethod))
                return null;

            return paymentMethod.Trim().ToUpperInvariant() switch
            {
                PaymentMethodCod => PaymentMethodCod,
                PaymentMethodMomo => PaymentMethodMomo,
                _ => null
            };
        }

        private static OperationResult ValidateCheckoutItems(IEnumerable<CheckoutItem> items)
        {
            foreach (var item in items)
            {
                if (item.Quantity <= 0)
                    return OperationResult.Fail("Item quantity must be greater than 0.");

                if (item.UnitPrice < 0)
                    return OperationResult.Fail("Item unit price cannot be negative.");

                var selectedItemTypes = 0;
                if (item.ProductId.HasValue) selectedItemTypes++;
                if (item.ComboId.HasValue) selectedItemTypes++;
                if (item.BowlId.HasValue) selectedItemTypes++;

                if (selectedItemTypes != 1)
                    return OperationResult.Fail("Each checkout item must contain exactly one of ProductId, ComboId, or BowlId.");
            }

            return OperationResult.Success();
        }

        //Helper trừ kho xoá giỏ hàng
        private async Task<OperationResult> DeductInventoryForOrder(int orderId, int storeId)
        {
            var orderItems = await _context.OrderItems
                .Where(oi => oi.OrderId == orderId && oi.ProductId.HasValue)
                .ToListAsync();

            foreach (var orderItem in orderItems)
            {
                if (!orderItem.ProductId.HasValue)
                    continue;

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

            var order = await _context.Orders
                .Include(o => o.Payments)
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.OrderId == request.OrderId);

            if (order == null)
                return NotFound("Order not found.");

            var momoPayment = order.Payments.FirstOrDefault(p => p.PaymentMethod == PaymentMethodMomo);
            if (momoPayment != null && momoPayment.Status != "Success")
            {
                return Accepted(new
                {
                    orderId = order.OrderId,
                    paymentStatus = momoPayment.Status,
                    orderStatus = order.StatusOrder,
                    message = "MoMo payment is waiting for the signed IPN callback."
                });
            }

            return Ok(new
            {
                orderId = order.OrderId,
                paymentStatus = order.Payments.FirstOrDefault()?.Status,
                orderStatus = order.StatusOrder,
                inventoryDeducted = order.InventoryDeducted
            });
        }


    }

}


