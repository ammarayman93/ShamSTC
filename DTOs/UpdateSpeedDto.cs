using System.ComponentModel.DataAnnotations;

namespace ISPSystem.DTOs
{
    public class UpdateSpeedDto
    {
        [Required(ErrorMessage = "«·”—⁄… „ÿ·Ê»…")]
        public string Speed { get; set; }  // „À«·: "10M/10M" √Ê "20M/5M"
    }
}