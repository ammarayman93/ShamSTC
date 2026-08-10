namespace ISPSystem.DTOs
{
    public class CreateSaleDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal? UnitSellPrice { get; set; }
        public int? ClientId { get; set; }
        public string ClientName { get; set; }
        public string SerialNumber { get; set; }
        public string Notes { get; set; }
    }
}