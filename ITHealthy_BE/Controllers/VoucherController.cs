using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ITHealthy.Models;
using System;
using ITHealthy.Data;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VouchersController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public VouchersController(ITHealthyDbContext context)
        {
            _context = context;
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAllVouchers()
        {
            var vouchers = await _context.Vouchers
                .Select(v => new
                {
                    v.VoucherId,
                    v.Code,
                    v.DescriptionVou,
                    v.StartDate,
                    v.ExpiryDate,
                    v.DiscountType,
                    v.DiscountValue,
                    v.MinOrderAmount,
                    v.MaxDiscountAmount,
                    v.MaxUsage,
                    v.UsedCount,
                    v.PerCustomerLimit,
                    v.IsActive,
                    v.IsStackable,
                    v.CreatedAt
                })
                .ToListAsync();

            return Ok(vouchers);
        }

        //  api/vouchers/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetVoucherById(int id)
        {
            var voucher = await _context.Vouchers
                .Where(v => v.VoucherId == id)
                .Select(v => new
                {
                    v.VoucherId,
                    v.Code,
                    v.DescriptionVou,
                    v.StartDate,
                    v.ExpiryDate,
                    v.DiscountType,
                    v.DiscountValue,
                    v.MinOrderAmount,
                    v.MaxDiscountAmount,
                    v.MaxUsage,
                    v.UsedCount,
                    v.PerCustomerLimit,
                    v.IsActive,
                    v.IsStackable,
                    v.CreatedAt,
                    Stores = _context.VoucherStores
                        .Where(vs => vs.VoucherId == v.VoucherId)
                        .Join(_context.Stores,
                            vs => vs.StoreId,
                            s => s.StoreId,
                            (vs, s) => new { s.StoreId, s.StoreName })
                        .ToList(),
                    Products = _context.VoucherProducts
                        .Where(vp => vp.VoucherId == v.VoucherId)
                        .Join(_context.Products,
                            vp => vp.ProductId,
                            p => p.ProductId,
                            (vp, p) => new { p.ProductId, p.ProductName })
                        .ToList(),
                    Categories = _context.VoucherCategories
                        .Where(vc => vc.VoucherId == v.VoucherId)
                        .Join(_context.Categories,
                            vc => vc.CategoryId,
                            c => c.CategoryId,
                            (vc, c) => new { c.CategoryId, c.CategoryName })
                        .ToList()
                })
                .FirstOrDefaultAsync();

            if (voucher == null)
                return NotFound(new { message = "Không tìm thấy voucher." });

            return Ok(voucher);
        }


        [HttpPost]
        public async Task<ActionResult> CreateVoucher([FromBody] VoucherCreateRequest request)
        {
            if (await _context.Vouchers.AnyAsync(v => v.Code == request.Code))
                return Conflict(new { message = "Mã voucher đã tồn tại." });

            var voucher = new Voucher
            {
                Code = request.Code,
                DescriptionVou = request.DescriptionVou,
                StartDate = request.StartDate,
                ExpiryDate = request.ExpiryDate,
                DiscountType = request.DiscountType,
                DiscountValue = request.DiscountValue,
                MinOrderAmount = request.MinOrderAmount,
                MaxDiscountAmount = request.MaxDiscountAmount,
                MaxUsage = request.MaxUsage,
                UsedCount = 0,
                PerCustomerLimit = request.PerCustomerLimit,
                IsActive = request.IsActive,
                IsStackable = request.IsStackable,
                CreatedAt = DateTime.Now
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();


            if (request.StoreIDs != null && request.StoreIDs.Count > 0)
            {
                foreach (var storeId in request.StoreIDs)
                {
                    _context.VoucherStores.Add(new VoucherStore
                    {
                        VoucherId = voucher.VoucherId,
                        StoreId = storeId
                    });
                }
            }


            if (request.ProductIDs != null && request.ProductIDs.Count > 0)
            {
                foreach (var productId in request.ProductIDs)
                {
                    _context.VoucherProducts.Add(new VoucherProduct
                    {
                        VoucherId = voucher.VoucherId,
                        ProductId = productId
                    });
                }
            }


            if (request.CategoryIDs != null && request.CategoryIDs.Count > 0)
            {
                foreach (var categoryId in request.CategoryIDs)
                {
                    _context.VoucherCategories.Add(new VoucherCategory
                    {
                        VoucherId = voucher.VoucherId,
                        CategoryId = categoryId
                    });
                }
            }

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVoucherById), new { id = voucher.VoucherId }, new
            { message = "Tạo voucher thành công.", voucher });
        }


        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateVoucher(int id, [FromBody] VoucherCreateRequest request)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
                return NotFound(new { message = "Không tìm thấy voucher." });

            voucher.DescriptionVou = request.DescriptionVou;
            voucher.StartDate = request.StartDate;
            voucher.ExpiryDate = request.ExpiryDate;
            voucher.DiscountType = request.DiscountType;
            voucher.DiscountValue = request.DiscountValue;
            voucher.MinOrderAmount = request.MinOrderAmount;
            voucher.MaxDiscountAmount = request.MaxDiscountAmount;
            voucher.MaxUsage = request.MaxUsage;
            voucher.PerCustomerLimit = request.PerCustomerLimit;
            voucher.IsActive = request.IsActive;
            voucher.IsStackable = request.IsStackable;


            _context.VoucherStores.RemoveRange(_context.VoucherStores.Where(vs => vs.VoucherId == id));
            _context.VoucherProducts.RemoveRange(_context.VoucherProducts.Where(vp => vp.VoucherId == id));
            _context.VoucherCategories.RemoveRange(_context.VoucherCategories.Where(vc => vc.VoucherId == id));


            if (request.StoreIDs != null)
                _context.VoucherStores.AddRange(request.StoreIDs.Select(storeId => new VoucherStore { VoucherId = id, StoreId = storeId }));

            if (request.ProductIDs != null)
                _context.VoucherProducts.AddRange(request.ProductIDs.Select(pid => new VoucherProduct { VoucherId = id, ProductId = pid }));

            if (request.CategoryIDs != null)
                _context.VoucherCategories.AddRange(request.CategoryIDs.Select(cid => new VoucherCategory { VoucherId = id, CategoryId = cid }));

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cập nhật voucher thành công." });
        }


        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteVoucher(int id)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
                return NotFound(new { message = "Không tìm thấy voucher." });

            _context.VoucherStores.RemoveRange(_context.VoucherStores.Where(vs => vs.VoucherId == id));
            _context.VoucherProducts.RemoveRange(_context.VoucherProducts.Where(vp => vp.VoucherId == id));
            _context.VoucherCategories.RemoveRange(_context.VoucherCategories.Where(vc => vc.VoucherId == id));
            _context.Vouchers.Remove(voucher);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa voucher thành công." });
        }

        // api/vouchers/store/{storeId}
        [HttpGet("store/{storeId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetVouchersByStore(int storeId)
        {
            var vouchers = await _context.Vouchers
                .Join(_context.VoucherStores,
                    v => v.VoucherId,
                    vs => vs.VoucherId,
                    (v, vs) => new { v, vs })
                .Where(x => x.vs.StoreId == storeId)
                .Select(x => new
                {
                    x.v.VoucherId,
                    x.v.Code,
                    x.v.DescriptionVou,
                    x.v.StartDate,
                    x.v.ExpiryDate,
                    x.v.DiscountType,
                    x.v.DiscountValue,
                    x.v.MinOrderAmount,
                    x.v.IsActive
                })
                .ToListAsync();

            return Ok(vouchers);
        }

        // api/vouchers/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetVouchersByProduct(int productId)
        {
            var vouchers = await _context.Vouchers
                .Join(_context.VoucherProducts,
                    v => v.VoucherId,
                    vp => vp.VoucherId,
                    (v, vp) => new { v, vp })
                .Where(x => x.vp.ProductId == productId)
                .Select(x => new
                {
                    x.v.VoucherId,
                    x.v.Code,
                    x.v.DescriptionVou,
                    x.v.StartDate,
                    x.v.ExpiryDate,
                    x.v.DiscountType,
                    x.v.DiscountValue,
                    x.v.MinOrderAmount,
                    x.v.IsActive
                })
                .ToListAsync();

            return Ok(vouchers);
        }



        // api/vouchers/category/{categoryId}
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetVouchersByCategory(int categoryId)
        {
            var vouchers = await _context.Vouchers
                .Join(_context.VoucherCategories,
                    v => v.VoucherId,
                    vc => vc.VoucherId,
                    (v, vc) => new { v, vc })
                .Where(x => x.vc.CategoryId == categoryId)
                .Select(x => new
                {
                    x.v.VoucherId,
                    x.v.Code,
                    x.v.DescriptionVou,
                    x.v.StartDate,
                    x.v.ExpiryDate,
                    x.v.DiscountType,
                    x.v.DiscountValue,
                    x.v.MinOrderAmount,
                    x.v.IsActive
                })
                .ToListAsync();

            return Ok(vouchers);
        }



        [HttpPost("validate")]
        public async Task<IActionResult> ValidateVoucher([FromBody] ValidateVoucherRequest request)
        {
            if (string.IsNullOrEmpty(request.Code))
                return BadRequest(new ValidateVoucherResponse
                {
                    Valid = false,
                    Message = "Vui lòng nhập mã voucher."
                });

            var voucher = await _context.Vouchers
                .Include(v => v.VoucherRedemptions)
                .FirstOrDefaultAsync(v => v.Code == request.Code);

            if (voucher == null)
                return Ok(new ValidateVoucherResponse
                {
                    Valid = false,
                    Message = "Mã voucher không tồn tại."
                });

            // Kiểm tra ACTIVE
            if (voucher.IsActive == false)
                return Ok(new ValidateVoucherResponse
                {
                    Valid = false,
                    Message = "Voucher đã bị khóa hoặc không còn hiệu lực."
                });

            // Kiểm tra ngày bắt đầu
            if (voucher.StartDate.HasValue && voucher.StartDate.Value > DateOnly.FromDateTime(DateTime.Now))
                return Ok(new ValidateVoucherResponse
                {
                    Valid = false,
                    Message = "Voucher chưa bắt đầu."
                });

            // Kiểm tra ngày hết hạn
            if (voucher.ExpiryDate.HasValue && voucher.ExpiryDate.Value < DateOnly.FromDateTime(DateTime.Now))
                return Ok(new ValidateVoucherResponse
                {
                    Valid = false,
                    Message = "Voucher đã hết hạn."
                });

            // Giới hạn tổng số lần dùng
            if (voucher.MaxUsage.HasValue && voucher.UsedCount >= voucher.MaxUsage)
                return Ok(new ValidateVoucherResponse
                {
                    Valid = false,
                    Message = "Voucher đã đạt số lần sử dụng tối đa."
                });

            // Giới hạn theo từng khách hàng
            if (voucher.PerCustomerLimit.HasValue)
            {
                int usedByCustomer = voucher.VoucherRedemptions
                    .Count(v => v.CustomerId == request.CustomerId);

                if (usedByCustomer >= voucher.PerCustomerLimit)
                    return Ok(new ValidateVoucherResponse
                    {
                        Valid = false,
                        Message = "Bạn đã sử dụng voucher này quá số lần cho phép."
                    });
            }

            // Kiểm tra giá trị đơn hàng tối thiểu
            if (voucher.MinOrderAmount.HasValue && request.OrderTotal < voucher.MinOrderAmount)
                return Ok(new ValidateVoucherResponse
                {
                    Valid = false,
                    Message = $"Đơn hàng cần tối thiểu {voucher.MinOrderAmount.Value:N0}đ để áp dụng voucher."
                });

            // ===== TÍNH SỐ TIỀN GIẢM =====
            decimal discount = 0;
            Console.WriteLine("OrderTotal: " + request.OrderTotal);
            Console.WriteLine("DiscountType: " + voucher.DiscountType);
            Console.WriteLine("DiscountValue: " + voucher.DiscountValue);
            Console.WriteLine("DiscountBeforeMax: " + discount);

            //giảm theo phần trăm
            if (voucher.DiscountType == "percent")
            {
                discount = request.OrderTotal * (voucher.DiscountValue ?? 0) / 100;

                // Giới hạn mức giảm tối đa
                if (voucher.MaxDiscountAmount.HasValue)
                    discount = Math.Min(discount, voucher.MaxDiscountAmount.Value);
            }
            //giảm theo số tiền
            else if (voucher.DiscountType == "fixed")
            {
                discount = voucher.DiscountValue ?? 0;
            }
            // Miễn phí vận chuyển
            else if (voucher.DiscountType == "FreeShipping")
            {
                // giảm toàn bộ phí ship (FE cần gửi ShippingFee)
                discount = request.ShippingFee;

                if (voucher.MaxDiscountAmount.HasValue)
                    discount = Math.Min(discount, voucher.MaxDiscountAmount.Value);
            }

            if (discount <= 0)
                return Ok(new ValidateVoucherResponse
                {
                    Valid = false,
                    Message = "Voucher không hợp lệ cho đơn hàng này."
                });

            return Ok(new ValidateVoucherResponse
            {
                Valid = true,
                Message = "Áp dụng voucher thành công!",
                VoucherId = voucher.VoucherId,
                DiscountAmount = discount
            });
        }


        [HttpPost("redeem")]
        public async Task<IActionResult> RedeemVoucher([FromBody] RedeemVoucherRequest request)
        {
            var voucher = await _context.Vouchers
                .Include(v => v.VoucherRedemptions)
                .FirstOrDefaultAsync(v => v.VoucherId == request.VoucherId);

            if (voucher == null) return NotFound("Voucher không tồn tại");

            // Tăng tổng số lần dùng
            voucher.UsedCount++;

            // Lưu bản ghi khách đã dùng
            _context.VoucherRedemptions.Add(new VoucherRedemption
            {
                VoucherId = voucher.VoucherId,
                CustomerId = request.CustomerId,
                OrderId = request.OrderId,
                Amount = request.Amount,
                RedeemedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Voucher đã được redeem thành công" });
        }

    }

}
