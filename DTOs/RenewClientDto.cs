namespace ISPSystem.DTOs
{
    public class RenewClientDto
    {
        /// <summary>
        /// اختياري: معرّف الباقة الجديدة عند التجديد بباقة مختلفة (سرعة مختلفة)
        /// </summary>
        public int? PlanId { get; set; }
    }
}
