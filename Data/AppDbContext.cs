using Microsoft.EntityFrameworkCore;
using ISPSystem.Models;

namespace ISPSystem.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Plan> Plans { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TicketReply> TicketReplies { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Purchase> Purchases { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }
        public DbSet<Device> Devices { get; set; }
        public DbSet<MikroTikDevice> MikroTikDevices { get; set; }

        // محاسبة
        public DbSet<Account> Accounts { get; set; }
        public DbSet<CashBox> CashBoxes { get; set; }
        public DbSet<CashBoxTransaction> CashBoxTransactions { get; set; }
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; }
        public DbSet<SalesInvoice> SalesInvoices { get; set; }
        public DbSet<SalesInvoiceItem> SalesInvoiceItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Client>().HasIndex(c => c.Username).IsUnique();
            modelBuilder.Entity<Client>().HasIndex(c => c.MacAddress).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
            modelBuilder.Entity<Product>().HasIndex(p => p.ModelNumber);
            modelBuilder.Entity<Product>().HasIndex(p => p.Code);

            modelBuilder.Entity<Product>().Property(p => p.CostPrice).HasPrecision(18, 2);
            modelBuilder.Entity<Product>().Property(p => p.SellPrice).HasPrecision(18, 2);
            modelBuilder.Entity<Purchase>().Property(p => p.CostPerUnit).HasPrecision(18, 2);
            modelBuilder.Entity<Purchase>().Property(p => p.Total).HasPrecision(18, 2);
            modelBuilder.Entity<Sale>().Property(s => s.UnitSellPrice).HasPrecision(18, 2);
            modelBuilder.Entity<Sale>().Property(s => s.Total).HasPrecision(18, 2);

            // Accounts
            modelBuilder.Entity<Account>().HasIndex(a => a.Code).IsUnique();
            modelBuilder.Entity<Account>()
                .HasOne(a => a.Parent)
                .WithMany(a => a.Children)
                .HasForeignKey(a => a.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Account>().Property(a => a.OpeningBalance).HasPrecision(18, 2);

            // CashBoxes
            modelBuilder.Entity<CashBox>().HasIndex(c => c.Code).IsUnique();
            modelBuilder.Entity<CashBox>().Property(c => c.Balance).HasPrecision(18, 2);
            modelBuilder.Entity<CashBox>()
                .HasOne(c => c.Account)
                .WithMany()
                .HasForeignKey(c => c.AccountId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<CashBoxTransaction>().Property(t => t.Amount).HasPrecision(18, 2);
            modelBuilder.Entity<CashBoxTransaction>().Property(t => t.BalanceAfter).HasPrecision(18, 2);
            modelBuilder.Entity<CashBoxTransaction>()
                .HasOne(t => t.CashBox)
                .WithMany(c => c.Transactions)
                .HasForeignKey(t => t.CashBoxId)
                .OnDelete(DeleteBehavior.Cascade);

            // Product accounts
            modelBuilder.Entity<Product>()
                .HasOne(p => p.InventoryAccount)
                .WithMany()
                .HasForeignKey(p => p.InventoryAccountId)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Product>()
                .HasOne(p => p.CostAccount)
                .WithMany()
                .HasForeignKey(p => p.CostAccountId)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Product>()
                .HasOne(p => p.RevenueAccount)
                .WithMany()
                .HasForeignKey(p => p.RevenueAccountId)
                .OnDelete(DeleteBehavior.SetNull);

            // Purchase invoices
            modelBuilder.Entity<PurchaseInvoice>().HasIndex(p => p.InvoiceNumber).IsUnique();
            modelBuilder.Entity<PurchaseInvoice>().Property(p => p.SubTotal).HasPrecision(18, 2);
            modelBuilder.Entity<PurchaseInvoice>().Property(p => p.Tax).HasPrecision(18, 2);
            modelBuilder.Entity<PurchaseInvoice>().Property(p => p.Discount).HasPrecision(18, 2);
            modelBuilder.Entity<PurchaseInvoice>().Property(p => p.Total).HasPrecision(18, 2);
            modelBuilder.Entity<PurchaseInvoice>().Property(p => p.PaidAmount).HasPrecision(18, 2);
            modelBuilder.Entity<PurchaseInvoiceItem>().Property(p => p.Quantity).HasPrecision(18, 3);
            modelBuilder.Entity<PurchaseInvoiceItem>().Property(p => p.UnitCost).HasPrecision(18, 2);
            modelBuilder.Entity<PurchaseInvoiceItem>().Property(p => p.LineTotal).HasPrecision(18, 2);
            modelBuilder.Entity<PurchaseInvoiceItem>()
                .HasOne(i => i.PurchaseInvoice)
                .WithMany(p => p.Items)
                .HasForeignKey(i => i.PurchaseInvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // Sales invoices
            modelBuilder.Entity<SalesInvoice>().HasIndex(p => p.InvoiceNumber).IsUnique();
            modelBuilder.Entity<SalesInvoice>().Property(p => p.SubTotal).HasPrecision(18, 2);
            modelBuilder.Entity<SalesInvoice>().Property(p => p.Tax).HasPrecision(18, 2);
            modelBuilder.Entity<SalesInvoice>().Property(p => p.Discount).HasPrecision(18, 2);
            modelBuilder.Entity<SalesInvoice>().Property(p => p.Total).HasPrecision(18, 2);
            modelBuilder.Entity<SalesInvoice>().Property(p => p.PaidAmount).HasPrecision(18, 2);
            modelBuilder.Entity<SalesInvoiceItem>().Property(p => p.Quantity).HasPrecision(18, 3);
            modelBuilder.Entity<SalesInvoiceItem>().Property(p => p.UnitPrice).HasPrecision(18, 2);
            modelBuilder.Entity<SalesInvoiceItem>().Property(p => p.LineTotal).HasPrecision(18, 2);
            modelBuilder.Entity<SalesInvoiceItem>()
                .HasOne(i => i.SalesInvoice)
                .WithMany(p => p.Items)
                .HasForeignKey(i => i.SalesInvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}