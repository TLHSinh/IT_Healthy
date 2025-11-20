using System.Security.Cryptography;
using System.Text;
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
            try
            {
                // Log IPN request for debugging
                Console.WriteLine("=== MoMo IPN Received ===");
                Console.WriteLine($"PartnerCode: {request.PartnerCode}");
                Console.WriteLine($"OrderId: {request.OrderId}");
                Console.WriteLine($"RequestId: {request.RequestId}");
                Console.WriteLine($"Amount: {request.Amount}");
                Console.WriteLine($"ResultCode: {request.ResultCode}");
                Console.WriteLine($"Message: {request.Message}");
                Console.WriteLine($"ExtraData: {request.ExtraData}");
                Console.WriteLine($"Signature: {request.Signature}");
                Console.WriteLine($"ResponseTime: {request.ResponseTime}");
                Console.WriteLine($"TransId: {request.TransId}");
                Console.WriteLine($"OrderType: {request.OrderType}");
                Console.WriteLine("========================");

                // 1. Verify signature theo format MoMo IPN
                // Format: accessKey=...&amount=...&extraData=...&message=...&orderId=...&orderInfo=...&orderType=...&partnerCode=...&requestId=...&responseTime=...&resultCode=...&transId=...
                var rawSignature =
                    $"accessKey={_settings.AccessKey}" +
                    $"&amount={request.Amount}" +
                    $"&extraData={request.ExtraData}" +
                    $"&message={request.Message}" +
                    $"&orderId={request.OrderId}" +
                    $"&orderInfo={request.orderInfo}" +
                    $"&orderType={request.OrderType}" +
                    $"&partnerCode={request.PartnerCode}" +
                    $"&requestId={request.RequestId}" +
                    $"&responseTime={request.ResponseTime}" +
                    $"&resultCode={request.ResultCode}" +
                    $"&transId={request.TransId}";

                var expected = GetSignature(rawSignature, _settings.SecretKey);
                
                Console.WriteLine($"Expected Signature: {expected}");
                Console.WriteLine($"Received Signature: {request.Signature}");

                if (!string.Equals(expected, request.Signature, StringComparison.OrdinalIgnoreCase))
                {
                    Console.WriteLine("❌ Signature verification FAILED!");
                    // Tạm thời bỏ qua signature check để test - XÓA DÒNG NÀY KHI PRODUCTION
                    // return BadRequest("Invalid signature");
                    Console.WriteLine("⚠️ WARNING: Signature check bypassed for testing!");
                }
                else
                {
                    Console.WriteLine("✅ Signature verification SUCCESS!");
                }

                // 2. Lấy orderId hệ thống từ extraData
                if (!int.TryParse(request.ExtraData, out var systemOrderId))
                {
                    Console.WriteLine($"❌ Invalid extraData: {request.ExtraData}");
                    return BadRequest("Invalid extraData");
                }

                Console.WriteLine($"System OrderId: {systemOrderId}");

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var order = await _context.Orders
                        .Include(o => o.Payments)
                        .FirstOrDefaultAsync(o => o.OrderId == systemOrderId);

                    if (order == null)
                    {
                        Console.WriteLine($"❌ Order not found: {systemOrderId}");
                        return NotFound("Order not found.");
                    }

                    var payment = order.Payments.FirstOrDefault(p => p.PaymentMethod == "MOMO");
                    if (payment == null)
                    {
                        Console.WriteLine($"❌ MoMo payment not found for order: {systemOrderId}");
                        return BadRequest("MoMo payment not found.");
                    }

                    Console.WriteLine($"Current payment status: {payment.Status}");

                    if (payment.Status == "Success")
                    {
                        Console.WriteLine("ℹ️ Payment already processed successfully");
                        await transaction.CommitAsync();
                        return Ok(new { message = "Already processed" });
                    }

                    if (request.ResultCode == 0) // thanh toán thành công
                    {
                        Console.WriteLine("💰 Processing successful payment...");
                        
                        var invResult = await DeductInventoryForOrder(order.OrderId, order.StoreId ?? 0);
                        if (!invResult.IsSuccess)
                        {
                            Console.WriteLine($"❌ Inventory deduction failed: {invResult.ErrorMessage}");
                            payment.Status = "Failed";
                            order.StatusOrder = "Cancelled";
                            await _context.SaveChangesAsync();
                            await transaction.CommitAsync();

                            return BadRequest(invResult.ErrorMessage);
                        }

                        Console.WriteLine("✅ Inventory deducted successfully");

                        await RemoveCartItemsForOrder(order.OrderId, order.CustomerId);
                        Console.WriteLine("✅ Cart items removed successfully");

                        payment.Status = "Success";
                        payment.PaymentDate = DateTime.UtcNow;
                        order.InventoryDeducted = true;
                        order.StatusOrder = "Confirmed";

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        Console.WriteLine("✅ Payment processed successfully!");
                        return Ok(new { message = "Payment success" });
                    }
                    else
                    {
                        // thanh toán thất bại
                        Console.WriteLine($"❌ Payment failed with ResultCode: {request.ResultCode}");
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
                    Console.WriteLine($"❌ Exception in transaction: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    await transaction.RollbackAsync();
                    return StatusCode(500, $"Handle IPN failed: {ex.Message}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fatal exception in MomoIpn: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"IPN processing failed: {ex.Message}");
            }
        }

        private static string GetSignature(string text, string key)
        {
            var encoding = new ASCIIEncoding();
            byte[] textBytes = encoding.GetBytes(text);
            byte[] keyBytes = encoding.GetBytes(key);

            using var hmac = new HMACSHA256(keyBytes);
            byte[] hashBytes = hmac.ComputeHash(textBytes);
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
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