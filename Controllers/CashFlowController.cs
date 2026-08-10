using System;
using System.Linq;
using System.Threading.Tasks;
using ISPSystem.Data;
using ISPSystem.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Controllers
{
    /// <summary>
    /// ملخص حركة الصناديق والتقارير السريعة
    /// </summary>
    [ApiController]
    [Route("api/cash-flow")]
    [Authorize]
    public class CashFlowController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CashFlowController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>أرصدة كل الصناديق + إجمالي</summary>
        [HttpGet("summary")]
        public async Task<IActionResult> Summary()
        {
            var boxes = await _context.CashBoxes
                .Where(c => c.IsActive)
                .OrderBy(c => c.Id)
                .Select(c => new
                {
                    c.Id,
                    c.Code,
                    c.Name,
                    c.Balance
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(new
            {
                boxes,
                totalBalance = boxes.Sum(b => b.Balance)
            }));
        }

        /// <summary>حركة يوم محدد أو آخر 7 أيام</summary>
        [HttpGet("daily")]
        public async Task<IActionResult> Daily([FromQuery] DateTime? date = null)
        {
            var day = (date ?? DateTime.Today).Date;
            var next = day.AddDays(1);

            var txs = await _context.CashBoxTransactions
                .Include(t => t.CashBox)
                .Where(t => t.Date >= day && t.Date < next)
                .OrderByDescending(t => t.Date)
                .Select(t => new
                {
                    t.Id,
                    t.Direction,
                    t.Amount,
                    t.BalanceAfter,
                    t.ReferenceType,
                    t.ReferenceId,
                    t.Notes,
                    t.Date,
                    CashBoxName = t.CashBox.Name,
                    CashBoxCode = t.CashBox.Code
                })
                .ToListAsync();

            var incoming = txs.Where(t => t.Direction == "In").Sum(t => t.Amount);
            var outgoing = txs.Where(t => t.Direction == "Out").Sum(t => t.Amount);

            return Ok(ApiResponse<object>.Ok(new
            {
                date = day,
                incoming,
                outgoing,
                net = incoming - outgoing,
                transactions = txs
            }));
        }

        /// <summary>آخر الحركات على كل الصناديق</summary>
        [HttpGet("recent")]
        public async Task<IActionResult> Recent([FromQuery] int take = 30)
        {
            var txs = await _context.CashBoxTransactions
                .Include(t => t.CashBox)
                .OrderByDescending(t => t.Date)
                .Take(Math.Min(take, 100))
                .Select(t => new
                {
                    t.Id,
                    t.Direction,
                    t.Amount,
                    t.ReferenceType,
                    t.Notes,
                    t.Date,
                    CashBoxName = t.CashBox.Name
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Ok(txs));
        }
    }
}
