using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ISPSystem.Models
{
    /// <summary>صلاحية دقيقة في النظام</summary>
    public class Permission
    {
        public int Id { get; set; }

        /// <summary>كود ثابت مثل clients.renew</summary>
        [Required, MaxLength(80)]
        public string Code { get; set; }

        [Required, MaxLength(120)]
        public string Name { get; set; }

        /// <summary>مجموعة العرض: clients, accounting, system...</summary>
        [MaxLength(40)]
        public string Group { get; set; }

        [MaxLength(250)]
        public string Description { get; set; }

        public int SortOrder { get; set; }

        public ICollection<RolePermission> RolePermissions { get; set; }
        public ICollection<UserPermission> UserPermissions { get; set; }
    }

    /// <summary>صلاحيات الدور (القالب)</summary>
    public class RolePermission
    {
        public int Id { get; set; }

        [Required, MaxLength(40)]
        public string Role { get; set; }

        public int PermissionId { get; set; }
        public Permission Permission { get; set; }
    }

    /// <summary>
    /// تخصيص صلاحية لمستخدم معيّن.
    /// IsGranted = true → إضافة، false → منع حتى لو الدور يملكها.
    /// </summary>
    public class UserPermission
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int PermissionId { get; set; }

        public bool IsGranted { get; set; } = true;

        public User User { get; set; }
        public Permission Permission { get; set; }
    }
}
