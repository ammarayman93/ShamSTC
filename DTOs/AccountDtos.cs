using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ISPSystem.DTOs
{
    public class CreateAccountDto
    {
        [Required]
        [StringLength(30)]
        public string Code { get; set; }

        [Required]
        [StringLength(150)]
        public string Name { get; set; }

        [Required]
        public string Type { get; set; }

        public int? ParentId { get; set; }

        public bool IsPostable { get; set; } = true;

        public decimal OpeningBalance { get; set; }

        public int SortOrder { get; set; }
    }

    public class UpdateAccountDto
    {
        [Required]
        [StringLength(150)]
        public string Name { get; set; }

        public bool IsPostable { get; set; }

        public bool IsActive { get; set; }

        public decimal OpeningBalance { get; set; }

        public int SortOrder { get; set; }
    }

    public class AccountTreeDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public int? ParentId { get; set; }
        public bool IsPostable { get; set; }
        public bool IsActive { get; set; }
        public decimal OpeningBalance { get; set; }
        public int Level { get; set; }
        public int SortOrder { get; set; }
        public List<AccountTreeDto> Children { get; set; } = new();
    }
}
