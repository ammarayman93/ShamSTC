namespace ISPSystem.DTOs
{
    public class CreateProductDto
    {
        public string Name { get; set; }
        public string ModelNumber { get; set; }
        public string SerialNumber { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SellPrice { get; set; }
        public int Quantity { get; set; }
        public string Description { get; set; }
        public int? MinStockAlert { get; set; } = 5;
    }

    public class UpdateProductDto
    {
        public string Name { get; set; }
        public string ModelNumber { get; set; }
        public string SerialNumber { get; set; }
        public decimal? CostPrice { get; set; }
        public decimal SellPrice { get; set; }
        public string Description { get; set; }
        public int? MinStockAlert { get; set; }
        public bool? IsActive { get; set; }
    }

}