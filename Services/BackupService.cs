using MySql.Data.MySqlClient;
using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace ISPSystem.Services
{
    public class BackupService
    {
        private readonly string _connectionString;
        private readonly string _backupPath;

        public BackupService(string connectionString)
        {
            _connectionString = connectionString;
            _backupPath = Path.Combine(Directory.GetCurrentDirectory(), "Backups");

            if (!Directory.Exists(_backupPath))
                Directory.CreateDirectory(_backupPath);
        }

        public async Task<string> CreateBackupAsync()
        {
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");
            var fileName = $"backup_{timestamp}.sql";
            var filePath = Path.Combine(_backupPath, fileName);

            try
            {
                var builder = new MySqlConnectionStringBuilder(_connectionString);
                var database = builder.Database;
                var user = string.IsNullOrEmpty(builder.UserID) ? "root" : builder.UserID;
                var password = builder.Password ?? "";
                var server = string.IsNullOrEmpty(builder.Server) ? "mysql" : builder.Server;
                var port = builder.Port == 0 ? 3306u : builder.Port;

                var mysqldump = FindTool("mysqldump");
                if (mysqldump == null)
                    throw new Exception("mysqldump غير موجود داخل الحاوية. ثبّت default-mysql-client في Dockerfile.");

                var psi = new ProcessStartInfo
                {
                    FileName = mysqldump,
                    Arguments = $"--host={server} --port={port} --user={user} --single-transaction --routines --triggers --events --set-gtid-purged=OFF {database}",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                };
                // تجنب مشاكل الرموز الخاصة في كلمة المرور داخل سطر الأوامر
                psi.Environment["MYSQL_PWD"] = password;

                using var process = new Process { StartInfo = psi };
                process.Start();

                await using (var fs = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None))
                await using (var writer = new StreamWriter(fs, new UTF8Encoding(false)))
                {
                    var stdoutTask = process.StandardOutput.BaseStream.CopyToAsync(fs);
                    var stderrTask = process.StandardError.ReadToEndAsync();
                    await Task.WhenAll(stdoutTask, process.WaitForExitAsync());
                    var error = await stderrTask;

                    if (process.ExitCode != 0)
                    {
                        if (File.Exists(filePath)) File.Delete(filePath);
                        throw new Exception($"Backup failed (exit {process.ExitCode}): {error}");
                    }
                }

                if (!File.Exists(filePath) || new FileInfo(filePath).Length == 0)
                    throw new Exception("تم إنشاء ملف النسخة لكنه فارغ.");

                return filePath;
            }
            catch (Exception ex)
            {
                throw new Exception($"Backup error: {ex.Message}", ex);
            }
        }

        public async Task<string> RestoreBackupAsync(string backupFilePath)
        {
            if (string.IsNullOrWhiteSpace(backupFilePath) || !File.Exists(backupFilePath))
                throw new Exception("ملف الاستعادة غير موجود.");

            try
            {
                var builder = new MySqlConnectionStringBuilder(_connectionString);
                var database = builder.Database;
                var user = string.IsNullOrEmpty(builder.UserID) ? "root" : builder.UserID;
                var password = builder.Password ?? "";
                var server = string.IsNullOrEmpty(builder.Server) ? "mysql" : builder.Server;
                var port = builder.Port == 0 ? 3306u : builder.Port;

                var mysql = FindTool("mysql");
                if (mysql == null)
                    throw new Exception("mysql client غير موجود داخل الحاوية. ثبّت default-mysql-client في Dockerfile.");

                var psi = new ProcessStartInfo
                {
                    FileName = mysql,
                    Arguments = $"--host={server} --port={port} --user={user} {database}",
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                };
                psi.Environment["MYSQL_PWD"] = password;

                using var process = new Process { StartInfo = psi };
                process.Start();

                await using (var file = File.OpenRead(backupFilePath))
                {
                    await file.CopyToAsync(process.StandardInput.BaseStream);
                    await process.StandardInput.BaseStream.FlushAsync();
                    process.StandardInput.Close();
                }

                var error = await process.StandardError.ReadToEndAsync();
                await process.WaitForExitAsync();

                if (process.ExitCode != 0)
                    throw new Exception($"Restore failed (exit {process.ExitCode}): {error}");

                return "Restore completed successfully";
            }
            catch (Exception ex)
            {
                throw new Exception($"Restore error: {ex.Message}", ex);
            }
        }

        public Task CleanOldBackupsAsync(int daysToKeep = 30)
        {
            var cutoffDate = DateTime.Now.AddDays(-daysToKeep);
            if (!Directory.Exists(_backupPath))
                return Task.CompletedTask;

            foreach (var file in Directory.GetFiles(_backupPath, "backup_*.sql"))
            {
                if (File.GetCreationTime(file) < cutoffDate)
                    File.Delete(file);
            }
            return Task.CompletedTask;
        }

        private static string FindTool(string name)
        {
            // Linux / Docker
            var linuxPaths = new[]
            {
                $"/usr/bin/{name}",
                $"/usr/local/bin/{name}",
                name // PATH
            };
            foreach (var p in linuxPaths)
            {
                try
                {
                    if (p == name) return name;
                    if (File.Exists(p)) return p;
                }
                catch { /* ignore */ }
            }

            // Windows (تطوير محلي)
            var win = $@"C:\Program Files\MySQL\MySQL Server 8.0\bin\{name}.exe";
            if (File.Exists(win)) return win;

            return null;
        }
    }
}