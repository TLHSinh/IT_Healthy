using System.Security.Cryptography.X509Certificates;
using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class StoreProductsController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public StoreProductsController(ITHealthyDbContext context)
        {
            _context = context;
        }

        // 🟢 GET: api/storeproducts
        // [HttpGet]
        // public async Task<IActionResult> GetAll()
        // {
        //     var data = await _context.StoreProducts
        //         .Include(sp => sp.Store)
        //         .Include(sp => sp.Product)
        //         .Select(sp => new
        //         {
        //             sp.StoreProductId,
        //             sp.StoreId,
        //             StoreName = sp.Store.StoreName,
        //             sp.ProductId,
        //             ProductName = sp.Product.ProductName,
        //             sp.Price,
        //             sp.Stock,
        //             sp.IsAvailable
        //         })
        //         .ToListAsync();

        //     return Ok(data);
        // }

        // // 🟢 GET: api/storeproducts/{id}
        // [HttpGet("{id}")]
        // public async Task<IActionResult> GetById(int id)
        // {
        //     var sp = await _context.StoreProducts
        //         .Include(s => s.Store)
        //         .Include(p => p.Product)
        //         .FirstOrDefaultAsync(x => x.StoreProductId == id);

        //     if (sp == null)
        //         return NotFound(new { message = "Không tìm thấy dữ liệu!" });

        //     return Ok(new
        //     {
        //         sp.StoreProductId,
        //         sp.StoreId,
        //         StoreName = sp.Store.StoreName,
        //         sp.ProductId,
        //         ProductName = sp.Product.ProductName,
        //         sp.Price,
        //         sp.Stock,
        //         sp.IsAvailable
        //     });
        // }

        // 🟢 GET: api/storeproducts/store/{storeId}
        [HttpGet("store/{storeId}")]
        public async Task<IActionResult> GetByStore(int storeId)
        {
            var list = await _context.StoreProducts
                .Include(sp => sp.Product)
                .Where(sp => sp.StoreId == storeId)
                .Select(sp => new
                {
                    sp.StoreProductId,
                    sp.ProductId,
                    ProductName = sp.Product != null ? sp.Product.ProductName : null,
                    DescriptionProduct = sp.Product != null ? sp.Product.DescriptionProduct : null,
                    sp.Price,
                    sp.Stock,

                })
                .ToListAsync();

            if (!list.Any())
                return Ok(new { message = "Cửa hàng này chưa có sản phẩm nào!", data = list });

            return Ok(new { message = "Danh sách sản phẩm của cửa hàng", data = list });
        }

        // 🟢 GET: api/storeproducts/product/{productId}
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var list = await _context.StoreProducts
                .Include(sp => sp.Store)
                .Where(sp => sp.ProductId == productId)
                .Select(sp => new
                {
                    sp.StoreProductId,
                    sp.StoreId,
                    StoreName = sp.Store != null ? sp.Store.StoreName : null,
                    sp.Price,
                    sp.Stock,
                })
                .ToListAsync();

            if (!list.Any())
                return Ok(new { message = "Sản phẩm này chưa được bán ở cửa hàng nào!", data = list });

            return Ok(new { message = "Danh sách cửa hàng đang kinh doanh sản phẩm này", data = list });
        }

        // 🟢 POST: api/storeproducts
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StoreProduct request)
        {
            var exists = await _context.StoreProducts
                .AnyAsync(sp => sp.StoreId == request.StoreId && sp.ProductId == request.ProductId);

            if (exists)
                return BadRequest(new { message = "Sản phẩm này đã tồn tại trong cửa hàng!" });

            // var newSP = new StoreProduct
            // {
            //     StoreId = request.StoreId,
            //     ProductId = request.ProductId,
            //     Price = request.Price,
            //     Stock = request.Stock ?? 0,
            //     IsAvailable = request.IsAvailable ?? true
            // };

            _context.StoreProducts.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Thêm sản phẩm vào cửa hàng thành công!", data = request });
        }

        // 🟢 PUT: api/storeproducts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] StoreProduct request)
        {
            var sp = await _context.StoreProducts.FindAsync(id);
            if (sp == null)
                return NotFound(new { message = "Không tìm thấy dữ liệu để cập nhật!" });

            var duplicate = await _context.StoreProducts
                .AnyAsync(x => x.StoreId == request.StoreId && x.ProductId == request.ProductId && x.StoreProductId != id);
            if (duplicate)
                return BadRequest(new { message = "Cặp StoreID - ProductID đã tồn tại!" });

            sp.StoreId = request.StoreId;
            sp.ProductId = request.ProductId;
            sp.Price = request.Price;
            sp.Stock = request.Stock;
            sp.IsAvailable = request.IsAvailable;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Cập nhật thành công!", data = sp });
        }

        // 🟢 DELETE: api/storeproducts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var sp = await _context.StoreProducts.FindAsync(id);
            if (sp == null)
                return NotFound(new { message = "Không tìm thấy dữ liệu để xóa!" });

            _context.StoreProducts.Remove(sp);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Xóa thành công!" });
        }
    }
}
