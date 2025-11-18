using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ITHealthy.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using ITHealthy.Data;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromotionsController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;
        public PromotionsController(ITHealthyDbContext context)
        {
            _context = context;
        }

   
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Promotion>>> GetAll()
        {
     
             return await _context.Promotions.ToListAsync();
        }

    
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetById(int id)
        {
            var promo = await _context.Promotions
                .Include(p => p.PromotionStores).ThenInclude(ps => ps.Store)
                .Include(p => p.PromotionProducts).ThenInclude(pp => pp.Product)
                .Include(p => p.PromotionCategories).ThenInclude(pc => pc.Category)
                .FirstOrDefaultAsync(p => p.PromotionId == id);

            if (promo == null)
                return NotFound();

            return Ok(new
            {
                promo.PromotionId,
                promo.PromotionName,
                promo.DescriptionPromotion,
                promo.StartDate,
                promo.EndDate,
                promo.DiscountType,
                promo.DiscountValue,
                promo.MinOrderAmount,
                promo.IsActive,
                Stores = promo.PromotionStores?.Select(ps => ps.Store.StoreName),
                Products = promo.PromotionProducts?.Select(pp => pp.Product.ProductName),
                Categories = promo.PromotionCategories?.Select(pc => pc.Category.CategoryName)
            });
        }
[HttpPut("{id}")]
public async Task<IActionResult> Update(int id, PromotionCreateRequest request)
{
    var promo = await _context.Promotions
        .Include(p => p.PromotionStores)
        .Include(p => p.PromotionProducts)
        .Include(p => p.PromotionCategories)
        .FirstOrDefaultAsync(p => p.PromotionId == id);

    if (promo == null)
        return NotFound();

    // Update fields
    promo.PromotionName = request.PromotionName;
    promo.DescriptionPromotion = request.DescriptionPromotion;
    promo.StartDate = request.StartDate;
    promo.EndDate = request.EndDate;
    promo.DiscountType = request.DiscountType;
    promo.DiscountValue = request.DiscountValue;
    promo.MinOrderAmount = request.MinOrderAmount;

    // Remove old relations
    _context.PromotionStores.RemoveRange(promo.PromotionStores);
    _context.PromotionProducts.RemoveRange(promo.PromotionProducts);
    _context.PromotionCategories.RemoveRange(promo.PromotionCategories);

    // Add new Store relations
    if (request.StoreIDs != null)
    {
        foreach (var idStore in request.StoreIDs)
        {
            _context.PromotionStores.Add(new PromotionStore
            {
                PromotionId = promo.PromotionId,
                StoreId = idStore
            });
        }
    }

    // Add new Product relations
    if (request.ProductIDs != null)
    {
        foreach (var idProduct in request.ProductIDs)
        {
            _context.PromotionProducts.Add(new PromotionProduct
            {
                PromotionId = promo.PromotionId,
                ProductId = idProduct
            });
        }
    }

    // Add new Category relations
    if (request.CategoryIDs != null)
    {
        foreach (var idCategory in request.CategoryIDs)
        {
            _context.PromotionCategories.Add(new PromotionCategory
            {
                PromotionId = promo.PromotionId,
                CategoryId = idCategory
            });
        }
    }

    await _context.SaveChangesAsync();
    return Ok(new { message = "Updated successfully" });
}

        

      
        [HttpPost]
        public async Task<ActionResult> Create(PromotionCreateRequest request)
        {
            if (request.StartDate >= request.EndDate)
                return BadRequest("Ngày bắt đầu phải nhỏ hơn ngày kết thúc.");

            var promo = new Promotion
            {
                PromotionName = request.PromotionName,
                DescriptionPromotion = request.DescriptionPromotion,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                DiscountType = request.DiscountType,
                DiscountValue = request.DiscountValue,
                MinOrderAmount = request.MinOrderAmount,
                IsActive = true
            };

            _context.Promotions.Add(promo);
            await _context.SaveChangesAsync();

            // --- Thêm Store ---
            if (request.StoreIDs != null)
            {
                foreach (var storeId in request.StoreIDs)
                {
                    if (await _context.Stores.AnyAsync(s => s.StoreId == storeId))
                        _context.PromotionStores.Add(new PromotionStore
                        {
                            PromotionId = promo.PromotionId,
                            StoreId = storeId
                        });
                }
            }

            // --- Thêm Product ---
            if (request.ProductIDs != null)
            {
                foreach (var productId in request.ProductIDs)
                {
                    if (await _context.Products.AnyAsync(p => p.ProductId == productId))
                        _context.PromotionProducts.Add(new PromotionProduct
                        {
                            PromotionId = promo.PromotionId,
                            ProductId = productId
                        });
                }
            }

            // --- Thêm Category ---
            if (request.CategoryIDs != null)
            {
                foreach (var categoryId in request.CategoryIDs)
                {
                    if (await _context.Categories.AnyAsync(c => c.CategoryId == categoryId))
                        _context.PromotionCategories.Add(new PromotionCategory
                        {
                            PromotionId = promo.PromotionId,
                            CategoryId = categoryId
                        });
                }
            }

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = promo.PromotionId }, promo);
        }

        //  Xóa promotion (và các liên kết)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var promo = await _context.Promotions
                .Include(p => p.PromotionStores)
                .Include(p => p.PromotionProducts)
                .Include(p => p.PromotionCategories)
                .FirstOrDefaultAsync(p => p.PromotionId == id);

            if (promo == null)
                return NotFound();

            _context.PromotionStores.RemoveRange(promo.PromotionStores);
            _context.PromotionProducts.RemoveRange(promo.PromotionProducts);
            _context.PromotionCategories.RemoveRange(promo.PromotionCategories);
            _context.Promotions.Remove(promo);

            await _context.SaveChangesAsync();
            return NoContent();
        }

        //  Lấy danh sách promotions theo store / product / category
        //  GET toàn bộ promotion theo StoreID
        [HttpGet("store/{storeId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetPromotionsByStore(int storeId)
        {
            var promotions = await _context.Promotions
                .Join(_context.PromotionStores,
                    p => p.PromotionId,
                    ps => ps.PromotionId,
                    (p, ps) => new { p, ps })
                .Where(x => x.ps.StoreId == storeId)
                .Select(x => new
                {
                    x.p.PromotionId,
                    x.p.PromotionName,
                    x.p.DescriptionPromotion,
                    x.p.StartDate,
                    x.p.EndDate,
                    x.p.DiscountType,
                    x.p.DiscountValue,
                    x.p.MinOrderAmount,
                    x.p.IsActive,
                    Store = _context.Stores
                        .Where(s => s.StoreId == x.ps.StoreId)
                        .Select(s => new { s.StoreId, s.StoreName })
                        .FirstOrDefault(),

                    Products = _context.PromotionProducts
                        .Where(pp => pp.PromotionId == x.p.PromotionId)
                        .Join(_context.Products,
                              pp => pp.ProductId,
                              pr => pr.ProductId,
                              (pp, pr) => new { pr.ProductId, pr.ProductName })
                        .ToList(),

                    Categories = _context.PromotionCategories
                        .Where(pc => pc.PromotionId == x.p.PromotionId)
                        .Join(_context.Categories,
                              pc => pc.CategoryId,
                              c => c.CategoryId,
                              (pc, c) => new { c.CategoryId, c.CategoryName })
                        .ToList()
                })
                .ToListAsync();

            return Ok(promotions);
        }

        // GET theo ProductID
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetPromotionsByProduct(int productId)
        {
            var promotions = await _context.Promotions
                .Join(_context.PromotionProducts,
                    p => p.PromotionId,
                    pp => pp.PromotionId,
                    (p, pp) => new { p, pp })
                .Where(x => x.pp.ProductId == productId)
                .Select(x => new
                {
                    x.p.PromotionId,
                    x.p.PromotionName,
                    x.p.DescriptionPromotion,
                    x.p.StartDate,
                    x.p.EndDate,
                    x.p.DiscountType,
                    x.p.DiscountValue,
                    x.p.MinOrderAmount,
                    x.p.IsActive
                })
                .ToListAsync();

            return Ok(promotions);
        }

        // GET theo CategoryID
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetPromotionsByCategory(int categoryId)
        {
            var promotions = await _context.Promotions
                .Join(_context.PromotionCategories,
                    p => p.PromotionId,
                    pc => pc.PromotionId,
                    (p, pc) => new { p, pc })
                .Where(x => x.pc.CategoryId == categoryId)
                .Select(x => new
                {
                    x.p.PromotionId,
                    x.p.PromotionName,
                    x.p.DescriptionPromotion,
                    x.p.StartDate,
                    x.p.EndDate,
                    x.p.DiscountType,
                    x.p.DiscountValue,
                    x.p.MinOrderAmount,
                    x.p.IsActive
                })
                .ToListAsync();

            return Ok(promotions);
        }
    }
}
