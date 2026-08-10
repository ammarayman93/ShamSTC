// backend/Data/RadiusDbContext.cs
using System;
using Microsoft.EntityFrameworkCore;

namespace ISPSystem.Data
{
    public class RadiusDbContext : DbContext
    {
        public RadiusDbContext(DbContextOptions<RadiusDbContext> options)
            : base(options) { }

        public DbSet<RadCheck> RadCheck { get; set; }
        public DbSet<RadUserGroup> RadUserGroup { get; set; }
        public DbSet<RadAcct> RadAcct { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RadCheck>().ToTable("radcheck");
            modelBuilder.Entity<RadUserGroup>().ToTable("radusergroup");
            modelBuilder.Entity<RadAcct>().ToTable("radacct");
        }
    }

    public class RadCheck
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Attribute { get; set; }
        public string Op { get; set; }
        public string Value { get; set; }
    }

    public class RadUserGroup
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string GroupName { get; set; }
        public int Priority { get; set; }
    }

    public class RadAcct
    {
        public int RadAcctId { get; set; }
        public string UserName { get; set; }
        public DateTime AcctStartTime { get; set; }
        public DateTime? AcctStopTime { get; set; }
        public long AcctInputOctets { get; set; }
        public long AcctOutputOctets { get; set; }
        public string AcctStatusType { get; set; }
    }
}