using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ISPSystem.Models;
using System;
using System.Linq;

namespace ISPSystem.Services
{
    public class PdfService
    {
        public PdfService()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public byte[] GenerateInvoicePdf(Invoice invoice, Client client, Subscription subscription, Plan plan)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                    // Header
                    page.Header()
                        .Row(row =>
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text("���� ���").Bold().FontSize(20);
                                col.Item().Text("S T C").FontSize(10);
                                col.Item().Text("����: 0946608064").FontSize(9);
                                col.Item().Text("������: info@sham.net").FontSize(9);
                            });

                            row.ConstantItem(100).Image("logo.png", ImageScaling.FitArea);
                        });

                    // Title
                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(col =>
                        {
                            col.Item().AlignCenter().Text("������").Bold().FontSize(16);

                            col.Item().PaddingTop(10).Row(row =>
                            {
                                row.RelativeItem().Text($"��� ��������: {invoice.InvoiceNumber}");
                                row.RelativeItem().AlignRight().Text($"�������: {invoice.Date:yyyy-MM-dd}");
                            });

                            // Client Info
                            col.Item().PaddingTop(10).BorderBottom(1).PaddingBottom(5).Text("������� ������").Bold();
                            col.Item().Row(row =>
                            {
                                row.RelativeItem().Text($"�����: {client.FullName}");
                                row.RelativeItem().Text($"������: {client.Phone}");
                            });
                            col.Item().Row(row =>
                            {
                                row.RelativeItem().Text($"������: {client.Email}");
                                row.RelativeItem().Text($"�������: {client.Address ?? "-"}");
                            });

                            // Subscription Info
                            col.Item().PaddingTop(10).BorderBottom(1).PaddingBottom(5).Text("������� ��������").Bold();
                            col.Item().Row(row =>
                            {
                                row.RelativeItem().Text($"������: {plan.Name}");
                                row.RelativeItem().Text($"������: {plan.Speed}");
                            });
                            col.Item().Row(row =>
                            {
                                row.RelativeItem().Text($"����� �����: {subscription.StartDate:yyyy-MM-dd}");
                                row.RelativeItem().Text($"����� ��������: {subscription.EndDate:yyyy-MM-dd}");
                            });

                            // Items Table
                            col.Item().PaddingTop(10).Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.ConstantColumn(30);
                                    columns.RelativeColumn(3);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(1);
                                    columns.RelativeColumn(1);
                                });

                                table.Header(header =>
                                {
                                    header.Cell().Background(Colors.Grey.Lighten2).Text("#").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Text("�����").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Text("������").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Text("�����").Bold();
                                    header.Cell().Background(Colors.Grey.Lighten2).Text("��������").Bold();
                                });

                                table.Cell().Text("1");
                                table.Cell().Text($"������ {plan.Name}");
                                table.Cell().Text("1");
                                table.Cell().Text($"{plan.Price:N0}");
                                table.Cell().Text($"{plan.Price:N0}");
                            });

                            // Total
                            col.Item().PaddingTop(10).AlignRight().Row(row =>
                            {
                                row.RelativeItem().Text($"�������: {invoice.Total:N0} �.�").Bold().FontSize(14);
                            });

                            // Footer
                            col.Item().PaddingTop(20).AlignCenter().Text("����� �������� �� ���� ���").FontSize(10);
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("���� ");
                            x.CurrentPageNumber();
                            x.Span(" �� ");
                            x.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }

        public byte[] GenerateReportPdf(string title, string[][] data, string[] headers)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);

                    page.Header()
                        .AlignCenter()
                        .Text(title)
                        .Bold()
                        .FontSize(18);

                    page.Content()
                        .Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                foreach (var _ in headers)
                                    columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                foreach (var h in headers)
                                    header.Cell().Background(Colors.Grey.Lighten2).Text(h).Bold();
                            });

                            foreach (var row in data)
                            {
                                foreach (var cell in row)
                                    table.Cell().Text(cell);
                            }
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}