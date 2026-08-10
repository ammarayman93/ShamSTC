namespace ISPSystem.DTOs
{
    public class CreateTicketDto
    {
        public int ClientId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; } = "Medium";
        public string Category { get; set; } = "General";
    }

    public class UpdateTicketStatusDto
    {
        public string Status { get; set; }
    }

    public class AddReplyDto
    {
        public int UserId { get; set; }
        public string Message { get; set; }
        public bool IsClient { get; set; }
    }
}