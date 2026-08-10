using ISPSystem.Models;
using ISPSystem.DTOs;

namespace ISPSystem.Services
{
    public interface ITicketService
    {
        Task<List<Ticket>> GetAll(int? clientId, string status);
        Task<Ticket> GetById(int id);
        Task<Ticket> Create(CreateTicketDto dto);
        Task<Ticket> UpdateStatus(int id, UpdateTicketStatusDto dto);
        Task<TicketReply> AddReply(int ticketId, AddReplyDto dto);
    }
}