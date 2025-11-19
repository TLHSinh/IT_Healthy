using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public OrdersController(ITHealthyDbContext context)
        {
            _context = context;
        }

        // ============================================
        // 🔹 1. GET ALL ORDERS
        // ============================================
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Combo)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Bowl)
                .Include(o => o.Customer)
                .Include(o => o.Store)
                .Select(o => new OrderDTO
                {
                    OrderId = o.OrderId,
                    CustomerId = o.CustomerId,
                    StoreId = o.StoreId,
                    OrderDate = o.OrderDate,
                    FinalPrice = o.FinalPrice,
                    StatusOrder = o.StatusOrder,
                    OrderType = o.OrderType,
                    OrderNote = o.OrderNote,
                    FullName = o.Customer != null ? o.Customer.FullName : null,
                    StoreName = o.Store != null ? o.Store.StoreName : null,
                    StreetAddress = o.Store != null ? o.Store.StreetAddress : null,
                    Ward = o.Store != null ? o.Store.Ward : null,
                    District = o.Store != null ? o.Store.District : null,
                    City = o.Store != null ? o.Store.City : null,
                    Country = o.Store != null ? o.Store.Country : null,
                    Postcode = o.Store != null ? o.Store.Postcode : null,


                    OrderItems = o.OrderItems.Select(oi => new OrderItemDTO
                    {
                        OrderItemId = oi.OrderItemId,
                        ProductId = oi.ProductId,
                        ComboId = oi.ComboId,
                        BowlId = oi.BowlId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice,

                        ProductName = oi.Product != null ? oi.Product.ProductName : null,
                        ComboName = oi.Combo != null ? oi.Combo.ComboName : null,
                        BowlName = oi.Bowl != null ? oi.Bowl.BowlName : null
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }


        // 🔹 2. GET ORDERS BY CUSTOMER ID
        // http://localhost:5000/api/orders/by-customer/1
        [HttpGet("by-customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetOrdersByCustomer(int customerId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Combo)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Bowl)
                .Include(o => o.Customer)
                .Include(o => o.Store)
                .Select(o => new OrderDTO
                {
                    OrderId = o.OrderId,
                    CustomerId = o.CustomerId,
                    StoreId = o.StoreId,
                    OrderDate = o.OrderDate,
                    FinalPrice = o.FinalPrice,
                    StatusOrder = o.StatusOrder,
                    OrderType = o.OrderType,
                    OrderNote = o.OrderNote,
                    FullName = o.Customer != null ? o.Customer.FullName : null,
                    StoreName = o.Store != null ? o.Store.StoreName : null,
                    StreetAddress = o.Store != null ? o.Store.StreetAddress : null,
                    Ward = o.Store != null ? o.Store.Ward : null,
                    District = o.Store != null ? o.Store.District : null,
                    City = o.Store != null ? o.Store.City : null,
                    Country = o.Store != null ? o.Store.Country : null,
                    Postcode = o.Store != null ? o.Store.Postcode : null,


                    OrderItems = o.OrderItems.Select(oi => new OrderItemDTO
                    {
                        OrderItemId = oi.OrderItemId,
                        ProductId = oi.ProductId,
                        ComboId = oi.ComboId,
                        BowlId = oi.BowlId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice,

                        ProductName = oi.Product != null ? oi.Product.ProductName : null,
                        ComboName = oi.Combo != null ? oi.Combo.ComboName : null,
                        BowlName = oi.Bowl != null ? oi.Bowl.BowlName : null
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }


        //  http://localhost:5000/api/orders/filter?status=paid&type=shipping

        //  http://localhost:5000/api/orders/filter?status=paid

        //  http://localhost:5000/api/orders/filter?type=shipping

        //  http://localhost:5000/api/orders/filter?status=paid&type=pickup

        //  http://localhost:5000/api/orders/filter?type=pickup

        [HttpGet("filter")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> FilterOrders(
            [FromQuery] string? status,
            [FromQuery] string? type)
        {
            var query = _context.Orders.AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(o => o.StatusOrder == status);

            if (!string.IsNullOrEmpty(type))
                query = query.Where(o => o.OrderType == type);

            var orders = await query
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Select(o => new OrderDTO
                {
                    OrderId = o.OrderId,
                    CustomerId = o.CustomerId,
                    StoreId = o.StoreId,
                    OrderDate = o.OrderDate,
                    FinalPrice = o.FinalPrice,
                    StatusOrder = o.StatusOrder,
                    OrderType = o.OrderType,
                    OrderNote = o.OrderNote,
                    FullName = o.Customer != null ? o.Customer.FullName : null,
                    StoreName = o.Store != null ? o.Store.StoreName : null,
                    StreetAddress = o.Store != null ? o.Store.StreetAddress : null,
                    Ward = o.Store != null ? o.Store.Ward : null,
                    District = o.Store != null ? o.Store.District : null,
                    City = o.Store != null ? o.Store.City : null,
                    Country = o.Store != null ? o.Store.Country : null,
                    Postcode = o.Store != null ? o.Store.Postcode : null,

                    OrderItems = o.OrderItems.Select(oi => new OrderItemDTO
                    {
                        OrderItemId = oi.OrderItemId,
                        ProductId = oi.ProductId,
                        ComboId = oi.ComboId,
                        BowlId = oi.BowlId,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice,

                        ProductName = oi.Product != null ? oi.Product.ProductName : null,
                        ComboName = oi.Combo != null ? oi.Combo.ComboName : null,
                        BowlName = oi.Bowl != null ? oi.Bowl.BowlName : null
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // ============================================
        // 🔹 4. GET ORDER BY ID
        // ============================================
        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrderById(int id)
        {
            var order = await _context.Orders
                 .Include(o => o.OrderItems)
                     .ThenInclude(oi => oi.Product)
                 .Include(o => o.OrderItems)
                     .ThenInclude(oi => oi.Combo)
                 .Include(o => o.OrderItems)
                     .ThenInclude(oi => oi.Bowl)
                 .Include(o => o.Customer)
                 .Include(o => o.Store)
                 .Select(o => new OrderDTO
                 {
                     OrderId = o.OrderId,
                     CustomerId = o.CustomerId,
                     StoreId = o.StoreId,
                     OrderDate = o.OrderDate,
                     FinalPrice = o.FinalPrice,
                     StatusOrder = o.StatusOrder,
                     OrderType = o.OrderType,
                     OrderNote = o.OrderNote,
                     FullName = o.Customer != null ? o.Customer.FullName : null,
                     StoreName = o.Store != null ? o.Store.StoreName : null,
                     StreetAddress = o.Store != null ? o.Store.StreetAddress : null,
                     Ward = o.Store != null ? o.Store.Ward : null,
                     District = o.Store != null ? o.Store.District : null,
                     City = o.Store != null ? o.Store.City : null,
                     Country = o.Store != null ? o.Store.Country : null,
                     Postcode = o.Store != null ? o.Store.Postcode : null,

                     OrderItems = o.OrderItems.Select(oi => new OrderItemDTO
                     {
                         OrderItemId = oi.OrderItemId,
                         ProductId = oi.ProductId,
                         ComboId = oi.ComboId,
                         BowlId = oi.BowlId,
                         Quantity = oi.Quantity,
                         UnitPrice = oi.UnitPrice,
                         TotalPrice = oi.TotalPrice,

                         ProductName = oi.Product != null ? oi.Product.ProductName : null,
                         ComboName = oi.Combo != null ? oi.Combo.ComboName : null,
                         BowlName = oi.Bowl != null ? oi.Bowl.BowlName : null
                     }).ToList()
                 })
                 .ToListAsync();

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng." });

            return Ok(order);
        }

        // ============================================
        // 🔹 5. UPDATE ORDER
        // PUT /api/orders/update/{id}
        // ============================================
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] Order request)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng." });

            order.StatusOrder = request.StatusOrder;
            order.OrderNote = request.OrderNote;
            order.OrderType = request.OrderType;
            order.StoreId = request.StoreId;
            order.FinalPrice = request.FinalPrice;
            order.DiscountApplied = request.DiscountApplied;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật đơn hàng thành công!" });
        }

        // ============================================
        // 🔹 6. DELETE ORDER
        // DELETE /api/orders/delete/{id}
        // ============================================
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng." });

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xoá đơn hàng thành công!" });
        }

        // CONFIRM ORDER (e.g. Pending → Confirmed)
        // PUT      http://localhost:5000/api/orders/status/1
        [HttpPut("status/{id}")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusDTO request)
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng." });

            if (string.IsNullOrEmpty(request.StatusOrder))
                return BadRequest(new { message = "StatusOrder không được để trống!" });

            order.StatusOrder = request.StatusOrder;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật trạng thái đơn hàng thành công!",
                newStatus = order.StatusOrder
            });
        }

    }
}
