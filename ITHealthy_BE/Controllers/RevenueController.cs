using ITHealthy.Data;
using ITHealthy.DTOs;
using ITHealthy.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ITHealthy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RevenueController : ControllerBase
    {
        private readonly ITHealthyDbContext _context;

        public RevenueController(ITHealthyDbContext context)
        {
            _context = context;
        }

        // ==============================
        // GET: api/revenue/report
        // Trả về doanh thu theo tháng (default) hoặc theo ngày nếu byDay = true
        // Tự động lấy store, year, month, day
        // ==============================
        [HttpGet("report")]
        public async Task<ActionResult<IEnumerable<StoreRevenueDTO>>> GetRevenueReport(
            int? storeId, DateTime? fromDate, DateTime? toDate, bool byDay = false)
        {
            var query = _context.Orders.Include(o => o.Store).AsQueryable();

            // Lọc theo store
            if (storeId.HasValue)
                query = query.Where(o => o.StoreId == storeId.Value);

            // Lọc theo ngày
            if (fromDate.HasValue)
                query = query.Where(o => o.OrderDate >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(o => o.OrderDate <= toDate.Value);

            // Chỉ lấy đơn hoàn thành
            query = query.Where(o => o.StatusOrder == "Paid" && o.OrderDate.HasValue);

            // Group theo Store + Year + Month (+ Day nếu byDay = true)
            var revenueReport = await query
                .GroupBy(o => new
                {
                    o.StoreId,
                    o.Store!.StoreName,
                    Year = o.OrderDate!.Value.Year,
                    Month = o.OrderDate!.Value.Month,
                    Day = byDay ? o.OrderDate.Value.Day : 0
                })
                .Select(g => new StoreRevenueDTO
                {
                    StoreId = g.Key.StoreId ?? 0,
                    StoreName = g.Key.StoreName,
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Day = g.Key.Day,
                    TotalRevenue = g.Sum(o => o.FinalPrice ?? 0)
                })
                .OrderBy(r => r.StoreId)
                .ThenBy(r => r.Year)
                .ThenBy(r => r.Month)
                .ThenBy(r => r.Day)
                .ToListAsync();

            return Ok(revenueReport);
        }
    }
}
