using MySql.Data.MySqlClient;
using System;
using System.Diagnostics;
using System.IO;
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
                var user = builder.UserID;
                var password = builder.Password;
                var server = builder.Server;

                var arguments = $"-h {server} -u {user} -p{password} {database} > \"{filePath}\"";

                var processStartInfo = new ProcessStartInfo
                {
                    FileName = "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe",
                    Arguments = arguments,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (var process = new Process { StartInfo = processStartInfo })
                {
                    process.Start();
                    await Task.Run(() => process.WaitForExit());

                    if (process.ExitCode != 0)
                    {
                        var error = await process.StandardError.ReadToEndAsync();
                        throw new Exception($"Backup failed: {error}");
                    }
                }

                return filePath;
            }
            catch (Exception ex)
            {
                throw new Exception($"Backup error: {ex.Message}");
            }
        }

        public async Task<string> RestoreBackupAsync(string backupFilePath)
        {
            try
            {
                var builder = new MySqlConnectionStringBuilder(_connectionString);
                var database = builder.Database;
                var user = builder.UserID;
                var password = builder.Password;
                var server = builder.Server;

                var arguments = $"-h {server} -u {user} -p{password} {database} < \"{backupFilePath}\"";

                var processStartInfo = new ProcessStartInfo
                {
                    FileName = "mysql",
                    Arguments = arguments,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (var process = new Process { StartInfo = processStartInfo })
                {
                    process.Start();
                    await Task.Run(() => process.WaitForExit());

                    if (process.ExitCode != 0)
                    {
                        var error = await process.StandardError.ReadToEndAsync();
                        throw new Exception($"Restore failed: {error}");
                    }
                }

                return "Restore completed successfully";
            }
            catch (Exception ex)
            {
                throw new Exception($"Restore error: {ex.Message}");
            }
        }

        public async Task CleanOldBackupsAsync(int daysToKeep = 30)
        {
            var cutoffDate = DateTime.Now.AddDays(-daysToKeep);
            var files = Directory.GetFiles(_backupPath, "backup_*.sql");

            foreach (var file in files)
            {
                if (File.GetCreationTime(file) < cutoffDate)
                {
                    File.Delete(file);
                }
            }
            await Task.CompletedTask;
        }
    }
}