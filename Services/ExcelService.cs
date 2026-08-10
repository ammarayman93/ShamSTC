using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using ISPSystem.Models;
using OfficeOpenXml;

namespace ISPSystem.Services
{
    public class ExcelService
    {
        public ExcelService()
        {
            // تعيين الترخيص (مطلوب لـ EPPlus)
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public byte[] ExportClientsToExcel(List<Client> clients)
        {
            try
            {
                using var excelPackage = new ExcelPackage();
                var worksheet = excelPackage.Workbook.Worksheets.Add("Clients");

                // Header
                worksheet.Cells[1, 1].Value = "ID";
                worksheet.Cells[1, 2].Value = "Name";
                worksheet.Cells[1, 3].Value = "Email";
                worksheet.Cells[1, 4].Value = "Phone";
                worksheet.Cells[1, 5].Value = "Status";

                // Data
                for (int i = 0; i < clients.Count; i++)
                {
                    worksheet.Cells[i + 2, 1].Value = clients[i].Id;
                    worksheet.Cells[i + 2, 2].Value = clients[i].FullName;
                    worksheet.Cells[i + 2, 3].Value = clients[i].Email;
                    worksheet.Cells[i + 2, 4].Value = clients[i].Phone;
                    worksheet.Cells[i + 2, 5].Value = clients[i].Status;
                }

                worksheet.Cells.AutoFitColumns();
                return excelPackage.GetAsByteArray();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ExcelService: {ex.Message}");
                return Array.Empty<byte>();
            }
        }
    }
}