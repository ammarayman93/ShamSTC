using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ISPSystem.Services;
using ISPSystem.DTOs;
using ISPSystem.Helpers;
using ISPSystem.Models;

namespace ISPSystem.backend.Controllers
{
    [ApiController]
    [Route("api/tickets")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _service;

        public TicketsController(ITicketService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? clientId, [FromQuery] string status)
        {
            try
            {
                var result = await _service.GetAll(clientId, status);
                return Ok(ApiResponse<List<Ticket>>.Ok(result));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTicketDto dto)
        {
            var ticket = await _service.Create(dto);
            return Ok(ApiResponse<Ticket>.Ok(ticket));
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin,Support")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTicketStatusDto dto)
        {
            var ticket = await _service.UpdateStatus(id, dto);

            if (ticket == null)
                return NotFound(ApiResponse<string>.Fail("التذكرة غير موجودة"));

            return Ok(ApiResponse<Ticket>.Ok(ticket));
        }

        [HttpPost("{id}/reply")]
        public async Task<IActionResult> AddReply(int id, [FromBody] AddReplyDto dto)
        {
            var reply = await _service.AddReply(id, dto);

            if (reply == null)
                return NotFound(ApiResponse<string>.Fail("التذكرة غير موجودة"));

            return Ok(ApiResponse<TicketReply>.Ok(reply));
        }
    }
}