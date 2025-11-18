using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using ITHealthy.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public CartController(ITHealthyDbContext context)
        {
            _context = context;
        }

        // Thêm sản phẩm vào giỏ
        //POST: http://localhost:5000/api/cart/add
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            // Lấy giỏ hàng của customer
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.CustomerId == dto.CustomerId);

            // Nếu chưa có giỏ thì tạo mới
            if (cart == null)
            {
                cart = new Cart
                {
                    CustomerId = dto.CustomerId,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            // Kiểm tra nếu sản phẩm đã tồn tại trong giỏ
            var existingItem = cart.CartItems.FirstOrDefault(i =>
                i.ProductId == dto.ProductId &&
                i.ComboId == dto.ComboId &&
                i.BowlId == dto.BowlId
            );

            if (existingItem != null)
            {
                existingItem.Quantity += dto.Quantity;
                existingItem.UnitPrice = dto.UnitPrice ?? existingItem.UnitPrice;
                existingItem.AddedAt = DateTime.Now;
            }
            else
            {
                var newItem = new CartItem
                {
                    CartId = cart.CartId,
                    ProductId = dto.ProductId,
                    ComboId = dto.ComboId,
                    BowlId = dto.BowlId,
                    Quantity = dto.Quantity,
                    UnitPrice = dto.UnitPrice,
                    AddedAt = DateTime.Now
                };
                _context.CartItems.Add(newItem);
            }

            cart.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã thêm sản phẩm vào giỏ hàng thành công!" });
        }

        // 🔄 2️⃣ Cập nhật số lượng sản phẩm trong giỏ
        [HttpPut("update/{cartItemId}")]
        public async Task<IActionResult> UpdateQuantity(int cartItemId, [FromBody] UpdateCartItemDto dto)
        {
            var item = await _context.CartItems.FirstOrDefaultAsync(i => i.CartItemId == cartItemId);
            if (item == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm trong giỏ hàng." });

            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Số lượng phải lớn hơn 0." });

            item.Quantity = dto.Quantity;
            item.AddedAt = DateTime.Now;

            var cart = await _context.Carts.FindAsync(item.CartId);
            if (cart != null)
                cart.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật số lượng thành công." });
        }

        // 🗑️ 3️⃣ Xoá sản phẩm khỏi giỏ
        [HttpDelete("remove/{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            var item = await _context.CartItems.FirstOrDefaultAsync(i => i.CartItemId == cartItemId);
            if (item == null)
                return NotFound(new { message = "Không tìm thấy sản phẩm trong giỏ hàng." });

            _context.CartItems.Remove(item);

            var cart = await _context.Carts.FindAsync(item.CartId);
            if (cart != null)
                cart.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Đã xoá sản phẩm khỏi giỏ hàng." });
        }

        //Lấy giỏ hàng theo CustomerId
        [HttpGet("user/{customerId}")]
        public async Task<IActionResult> GetCartByCustomer(int customerId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(i => i.Product)
                .Include(c => c.CartItems)
                    .ThenInclude(i => i.Combo)
                .Include(c => c.CartItems)
                    .ThenInclude(i => i.Bowl)
                .FirstOrDefaultAsync(c => c.CustomerId == customerId);

            if (cart == null)
            {
                return NotFound(new
                {
                    message = "Giỏ hàng trống hoặc người dùng chưa có giỏ hàng."
                });
            }

            // Tính tổng tiền giỏ hàng
            var totalPrice = cart.CartItems.Sum(i => (i.UnitPrice ?? 0) * i.Quantity);

            // Trả dữ liệu về frontend
            var result = new
            {
                cart.CartId,
                cart.CustomerId,
                cart.CreatedAt,
                cart.UpdatedAt,
                totalPrice,
                items = cart.CartItems.Select(i => new
                {
                    i.CartItemId,
                    i.ProductId,
                    ProductName = i.Product != null ? i.Product.ProductName : null,
                    ImageProduct = i.Product != null ? i.Product.ImageProduct : null,
                    DescriptionProduct = i.Product != null ? i.Product.DescriptionProduct : null,
                    i.ComboId,
                    ComboName = i.Combo != null ? i.Combo.ComboName : null,
                    i.BowlId,
                    BowlName = i.Bowl != null ? i.Bowl.BowlName : null,
                    i.Quantity,
                    i.UnitPrice,
                    SubTotal = (i.UnitPrice ?? 0) * i.Quantity
                })
            };

            return Ok(result);
        }

    }


    public class UpdateCartItemDto
    {
        public int Quantity { get; set; }
    }
}
