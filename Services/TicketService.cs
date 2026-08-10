using ISPSystem.Data;
using ISPSystem.DTOs;
using ISPSystem.Models;
using ISPSystem.Helpers;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Services
{
    public class TicketService : ITicketService
    {
        private readonly AppDbContext _context;
        private readonly AuditService _audit;

        public TicketService(AppDbContext context, AuditService audit)
        {
            _context = context;
            _audit = audit;
        }

        public async Task<List<Ticket>> GetAll(int? clientId, string status)
        {
            var query = _context.Tickets
                .Include(t => t.Client)
                .Include(t => t.AssignedUser)
                .AsQueryable();

            if (clientId.HasValue)
                query = query.Where(t => t.ClientId == clientId.Value);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(t => t.Status == status);

            return await query.OrderByDescending(t => t.CreatedAt).ToListAsync();
        }

        public async Task<Ticket> GetById(int id)
        {
            return await _context.Tickets
                .Include(t => t.Client)
                .Include(t => t.AssignedUser)
                .Include(t => t.Replies)
                    .ThenInclude(r => r.User)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<Ticket> Create(CreateTicketDto dto)
        {
            if (dto.ClientId <= 0)
                throw new Exception("ClientId €Ì— ’ÕÌÕ");

            var clientExists = await _context.Clients.AnyAsync(c => c.Id == dto.ClientId);
            if (!clientExists)
                throw new Exception("«·⁄„Ì· €Ì— „ÊÃÊœ");

            var ticket = new Ticket
            {
                ClientId = dto.ClientId,
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                Category = dto.Category,
                Status = "Open",
                CreatedAt = DateTime.Now
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            await _audit.Log("Create", "Ticket", ticket.Id);

            return ticket;
        }

        public async Task<Ticket> UpdateStatus(int id, UpdateTicketStatusDto dto)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return null;

            ticket.Status = dto.Status;

            if (dto.Status == "Resolved" || dto.Status == "Closed")
                ticket.ResolvedAt = DateTime.Now;

            await _context.SaveChangesAsync();
            await _audit.Log("UpdateStatus", "Ticket", id);

            return ticket;
        }

        public async Task<TicketReply> AddReply(int ticketId, AddReplyDto dto)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null) return null;

            var reply = new TicketReply
            {
                TicketId = ticketId,
                UserId = dto.UserId,
                Message = dto.Message,
                IsClient = dto.IsClient,
                CreatedAt = DateTime.Now
            };

            _context.TicketReplies.Add(reply);

            ticket.Status = dto.IsClient ? "Open" : "InProgress";

            await _context.SaveChangesAsync();

            return reply;
        }
    }
}