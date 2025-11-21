using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;
        private readonly MomoSettings _settings;

        public PaymentController(ITHealthyDbContext context, IOptions<MomoSettings> options)
        {
            _context = context;
            _settings = options.Value;
        }

        [HttpPost("momo-ipn")]
        public async Task<IActionResult> MomoIpn([FromBody] MomoIpnRequest request)
        {
            Console.WriteLine("=== MoMo IPN Received ===");
            Console.WriteLine(JsonSerializer.Serialize(request));

            try
            {
                string rawSignature =
    $"accessKey={_settings.AccessKey}" +
    $"&amount={request.amount}" +
    $"&extraData={request.extraData}" +
    $"&message={request.message}" +
    $"&orderId={request.orderId}" +
    $"&orderInfo={request.orderInfo ?? ""}" +
    $"&orderType={request.orderType ?? ""}" +
    $"&partnerCode={request.partnerCode}" +
    $"&payType={request.payType ?? ""}" +
    $"&requestId={request.requestId}" +
    $"&responseTime={request.responseTime ?? ""}" +
    $"&resultCode={request.resultCode}" +
    $"&transId={request.transId ?? ""}";


                var expected = GetSignature(rawSignature, _settings.SecretKey);
                if (!string.Equals(expected, request.signature, StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine("❌ Signature invalid");
                    return BadRequest(new { message = "Invalid signature" });
                }
                Console.WriteLine("✅ Signature OK");

                Console.WriteLine("RAW SIGNATURE ===> " + rawSignature);
                Console.WriteLine("EXPECTED SIGNATURE ===> " + expected);
                Console.WriteLine("MOMO SIGNATURE ===> " + request.signature);


                // ==============================
                // 2️⃣ DECODE extraData -> ORDERID
                // ==============================
                string decodedExtra = Encoding.UTF8.GetString(Convert.FromBase64String(request.extraData));

                if (!int.TryParse(decodedExtra, out int systemOrderId))
                {
                    return BadRequest(new { message = "Invalid extraData" });
                }
                Console.WriteLine($"🆔 SYSTEM ORDERID: {systemOrderId}");

                using var transaction = await _context.Database.BeginTransactionAsync();

                var order = await _context.Orders
                    .Include(o => o.Payments)
                    .FirstOrDefaultAsync(o => o.OrderId == systemOrderId);

                if (order == null)
                {
                    return NotFound(new { message = "Order not found" });
                }

                var payment = order.Payments.FirstOrDefault(p => p.PaymentMethod == "MOMO");
                if (payment == null)
                {
                    return BadRequest(new { message = "MoMo payment not found" });
                }

                // ==============================
                // 3️⃣ IF SUCCESS -> UPDATE STATUS
                // ==============================
                if (request.resultCode == 0)
                {
                    if (payment.Status == "Success")
                    {
                        Console.WriteLine("⚠️ Payment already processed");
                        return Ok(new { message = "Already processed" });
                    }

                    var invResult = await DeductInventoryForOrder(order.OrderId, order.StoreId ?? 0);
                    if (!invResult.IsSuccess)
                    {
                        payment.Status = "Failed";
                        order.StatusOrder = "Cancelled";
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return BadRequest(invResult.ErrorMessage);
                    }

                    await RemoveCartItemsForOrder(order.OrderId, order.CustomerId);

                    payment.Status = "Success";
                    payment.PaymentDate = DateTime.UtcNow;
                    order.InventoryDeducted = true;
                    order.StatusOrder = "Confirmed";

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new { message = "Payment success" });
                }
                else
                {
                    payment.Status = "Failed";
                    payment.PaymentDate = DateTime.UtcNow;
                    order.StatusOrder = "Cancelled";

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new { message = "Payment failed" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ EXCEPTION: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }
        private static string GetSignature(string text, string key)
        {
            byte[] textBytes = Encoding.UTF8.GetBytes(text);
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);

            using var hmac = new HMACSHA256(keyBytes);
            return BitConverter.ToString(hmac.ComputeHash(textBytes))
                               .Replace("-", "")
                               .ToLower();
        }



        [HttpGet("redirect-success")]
        public IActionResult RedirectSuccess(int systemOrderId)
        {
            // Redirect về FE React và truyền orderId qua state
            return Redirect($"http://localhost:3000/payment-success?orderId={systemOrderId}");
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


    }

}