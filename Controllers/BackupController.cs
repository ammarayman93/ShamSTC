using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ISPSystem.Helpers;
using ISPSystem.Services;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using System;

namespace ISPSystem.Controllers
{
    [ApiController]
    [Route("api/backup")]
    [Authorize(Roles = "Admin")]
    public class BackupController : ControllerBase
    {
        private readonly BackupService _backupService;
        private const string BackupFolderName = "Backups";

        public BackupController(BackupService backupService)
        {
            _backupService = backupService;
        }

        // 💾 إنشاء نسخة احتياطية جديدة وتحميلها فوراً
        [HttpPost("create")]
        public async Task<IActionResult> CreateBackup()
        {
            try
            {
                var filePath = await _backupService.CreateBackupAsync();

                if (!System.IO.File.Exists(filePath))
                    return BadRequest(ApiResponse<string>.Fail("فشل توليد ملف النسخة الاحتياطية."));

                var fileName = Path.GetFileName(filePath);

                // 🚀 تحسين: استخدام FileStream بدلاً من ReadAllBytesAsync لتوفير الذاكرة ومنع قفل الملف
                var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
                return File(fileStream, "application/octet-stream", fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // 🔄 استعادة نسخة احتياطية مرفوعة من الـ Frontend
        [HttpPost("restore")]
        public async Task<IActionResult> RestoreBackup(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(ApiResponse<string>.Fail("الملف غير موجود أو فارغ"));

                var tempPath = Path.GetTempFileName();

                using (var stream = System.IO.File.Create(tempPath))
                {
                    await file.CopyToAsync(stream);
                }

                var result = await _backupService.RestoreBackupAsync(tempPath);

                // تنظيف الملف المؤقت بعد الانتهاء
                if (System.IO.File.Exists(tempPath))
                    System.IO.File.Delete(tempPath);

                return Ok(ApiResponse<string>.Ok(result));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // 📋 عرض قائمة الملفات المتوفرة في سيرفر الباكاب
        [HttpGet("list")]
        public IActionResult ListBackups()
        {
            try
            {
                var backupPath = Path.Combine(Directory.GetCurrentDirectory(), BackupFolderName);
                if (!Directory.Exists(backupPath))
                    Directory.CreateDirectory(backupPath);

                var files = Directory.GetFiles(backupPath, "backup_*.sql");
                var backups = new System.Collections.Generic.List<object>();

                foreach (var file in files)
                {
                    var fileInfo = new FileInfo(file);
                    backups.Add(new
                    {
                        Name = Path.GetFileName(file),
                        Size = fileInfo.Length,
                        CreatedAt = fileInfo.CreationTime
                    });
                }

                return Ok(ApiResponse<object>.Ok(backups));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }

        // ⬇️ تحميل ملف باكاب محدد من القائمة باسمه
        [HttpGet("download/{fileName}")]
        public IActionResult DownloadBackup(string fileName)
        {
            try
            {
                if (string.IsNullOrEmpty(fileName))
                    return BadRequest(ApiResponse<string>.Fail("اسم الملف مطلوب"));

                var backupPath = Path.Combine(Directory.GetCurrentDirectory(), BackupFolderName);

                // الحماية من هجمات الـ Path Traversal (منع الخروج من مجلد الـ Backups عبر تمرير ../)
                var safeFileName = Path.GetFileName(fileName);
                var filePath = Path.Combine(backupPath, safeFileName);

                if (!System.IO.File.Exists(filePath))
                    return NotFound(ApiResponse<string>.Fail("الملف المطلوب غير موجود في السيرفر"));

                // 🚀 بث الملف عبر الـ Stream لضمان الاستقرار مع الملفات الضخمة
                var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
                return File(fileStream, "application/octet-stream", safeFileName);
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponse<string>.Fail(ex.Message));
            }
        }
    }
}