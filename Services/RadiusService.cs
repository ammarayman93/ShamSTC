using MySqlConnector;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;
using ISPSystem.Models;

namespace ISPSystem.Services
{
    public class RadiusService
    {
        private readonly string _connectionString;
        private readonly ILogger<RadiusService> _logger;

        public RadiusService(IConfiguration config, ILogger<RadiusService> logger)
        {
            _connectionString = config.GetConnectionString("RadiusConnection")
                ?? config.GetConnectionString("DefaultConnection");
            _logger = logger;
        }

        public async Task<bool> CreateUser(string username, string password, string speed, DateTime? expiration = null)
        {
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();

                await DeleteUserInternal(conn, username);

                await Exec(conn,
                    "INSERT INTO radcheck (username, attribute, op, value) VALUES (@u,'Cleartext-Password',':=',@p)",
                    ("@u", username), ("@p", password));

                if (!string.IsNullOrWhiteSpace(speed))
                {
                    var rate = NormalizeSpeed(speed);
                    await Exec(conn,
                        "INSERT INTO radreply (username, attribute, op, value) VALUES (@u,'Mikrotik-Rate-Limit',':=',@s)",
                        ("@u", username), ("@s", rate));
                }

                if (expiration.HasValue)
                {
                    var exp = expiration.Value.ToString("dd MMM yyyy HH:mm:ss",
                        System.Globalization.CultureInfo.InvariantCulture);
                    await Exec(conn,
                        "INSERT INTO radcheck (username, attribute, op, value) VALUES (@u,'Expiration',':=',@e)",
                        ("@u", username), ("@e", exp));
                }

                _logger.LogInformation("RADIUS CreateUser OK: {User}", username);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RADIUS CreateUser failed: {User}", username);
                return false; // لا يرمي Exception حتى لا يطيح التطبيق
            }
        }

        public async Task<bool> EnableUser(string username)
        {
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();
                await Exec(conn, "DELETE FROM radcheck WHERE username=@u AND attribute='Auth-Type'", ("@u", username));
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RADIUS EnableUser failed: {User}", username);
                return false;
            }
        }

        public async Task<bool> DisableUser(string username)
        {
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();
                await Exec(conn, "DELETE FROM radcheck WHERE username=@u AND attribute='Auth-Type'", ("@u", username));
                await Exec(conn,
                    "INSERT INTO radcheck (username, attribute, op, value) VALUES (@u,'Auth-Type',':=','Reject')",
                    ("@u", username));
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RADIUS DisableUser failed: {User}", username);
                return false;
            }
        }

        public async Task<bool> UpdateSpeed(string username, string speed)
        {
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();
                var rate = NormalizeSpeed(speed);
                await Exec(conn, "DELETE FROM radreply WHERE username=@u AND attribute='Mikrotik-Rate-Limit'", ("@u", username));
                await Exec(conn,
                    "INSERT INTO radreply (username, attribute, op, value) VALUES (@u,'Mikrotik-Rate-Limit',':=',@s)",
                    ("@u", username), ("@s", rate));
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RADIUS UpdateSpeed failed: {User}", username);
                return false;
            }
        }

        public async Task<bool> UpdateExpiration(string username, DateTime expiration)
        {
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();
                await Exec(conn, "DELETE FROM radcheck WHERE username=@u AND attribute='Expiration'", ("@u", username));
                var exp = expiration.ToString("dd MMM yyyy HH:mm:ss", System.Globalization.CultureInfo.InvariantCulture);
                await Exec(conn,
                    "INSERT INTO radcheck (username, attribute, op, value) VALUES (@u,'Expiration',':=',@e)",
                    ("@u", username), ("@e", exp));
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RADIUS UpdateExpiration failed: {User}", username);
                return false;
            }
        }

        public async Task<bool> DeleteUser(string username)
        {
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();
                await DeleteUserInternal(conn, username);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RADIUS DeleteUser failed: {User}", username);
                return false;
            }
        }

        private async Task DeleteUserInternal(MySqlConnection conn, string username)
        {
            await Exec(conn, "DELETE FROM radcheck WHERE username=@u", ("@u", username));
            await Exec(conn, "DELETE FROM radreply WHERE username=@u", ("@u", username));
            await Exec(conn, "DELETE FROM radusergroup WHERE username=@u", ("@u", username));
        }

        private async Task Exec(MySqlConnection conn, string sql, params (string n, object v)[] ps)
        {
            await using var cmd = new MySqlCommand(sql, conn);
            foreach (var p in ps)
                cmd.Parameters.AddWithValue(p.n, p.v ?? DBNull.Value);
            await cmd.ExecuteNonQueryAsync();
        }

        private string NormalizeSpeed(string speed)
        {
            if (string.IsNullOrWhiteSpace(speed)) return "1M/1M";
            speed = speed.Replace("Mb/s", "M").Replace("Mbps", "M").Trim();
            if (!speed.Contains("/")) speed = $"{speed}/{speed}";
            return speed;
        }
        // ========== هل العميل متصل الآن؟ (من radacct) ==========
        public async Task<bool> IsUserOnline(string username)
        {
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();

                await using var cmd = new MySqlCommand(
                    @"SELECT COUNT(*) FROM radacct 
              WHERE username = @u AND acctstoptime IS NULL",
                    conn);
                cmd.Parameters.AddWithValue("@u", username);

                var count = Convert.ToInt32(await cmd.ExecuteScalarAsync());
                return count > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "IsUserOnline failed: {User}", username);
                return false;
            }
        }

        // ========== جلب كل المستخدمين المتصلين حالياً ==========
        public async Task<Dictionary<string, OnlineSessionInfo>> GetOnlineUsers()
        {
            var result = new Dictionary<string, OnlineSessionInfo>(StringComparer.OrdinalIgnoreCase);
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();

                await using var cmd = new MySqlCommand(
                    @"SELECT username, framedipaddress, callingstationid, 
                     acctstarttime, nasipaddress, acctsessionid
              FROM radacct 
              WHERE acctstoptime IS NULL
              ORDER BY acctstarttime DESC",
                    conn);

                await using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    var user = reader.GetString(0);
                    if (!result.ContainsKey(user))
                    {
                        result[user] = new OnlineSessionInfo
                        {
                            Username = user,
                            FramedIp = reader.IsDBNull(1) ? null : reader.GetString(1),
                            MacAddress = reader.IsDBNull(2) ? null : reader.GetString(2),
                            StartTime = reader.IsDBNull(3) ? null : reader.GetDateTime(3),
                            NasIp = reader.IsDBNull(4) ? null : reader.GetString(4),
                            SessionId = reader.IsDBNull(5) ? null : reader.GetString(5)
                        };
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetOnlineUsers failed");
            }
            return result;
        }

        // ========== فصل الجلسة (إغلاق محاسبي + Reject) ==========
        // ملاحظة: فصل الجلسة الفعلية على المايكروتيك يتم عبر MikroTikService.KickActiveUser
        public async Task<bool> DisconnectUser(string username)
        {
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();

                await Exec(conn,
                    @"UPDATE radacct SET acctstoptime = NOW(), 
              acctterminatecause = 'Admin-Reset'
              WHERE username = @u AND acctstoptime IS NULL",
                    ("@u", username));

                await DisableUser(username);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DisconnectUser failed: {User}", username);
                return false;
            }
        }

        // ========== جلب كلمة المرور الصريحة من radcheck (للعرض للأدمن فقط) ==========
        
        public async Task<object> GetUserUsage(string username)
        {
            long sessionIn = 0, sessionOut = 0, totalIn = 0, totalOut = 0;
            DateTime? sessionStart = null;
            string framedIp = null, mac = null;
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();

                await using (var cmd = new MySqlCommand(
                    @"SELECT IFNULL(SUM(acctinputoctets),0), IFNULL(SUM(acctoutputoctets),0)
                      FROM radacct WHERE username=@u AND acctstoptime IS NULL", conn))
                {
                    cmd.Parameters.AddWithValue("@u", username);
                    await using var r = await cmd.ExecuteReaderAsync();
                    if (await r.ReadAsync())
                    {
                        sessionIn = r.GetInt64(0);
                        sessionOut = r.GetInt64(1);
                    }
                }

                await using (var cmd = new MySqlCommand(
                    @"SELECT IFNULL(SUM(acctinputoctets),0), IFNULL(SUM(acctoutputoctets),0)
                      FROM radacct WHERE username=@u", conn))
                {
                    cmd.Parameters.AddWithValue("@u", username);
                    await using var r = await cmd.ExecuteReaderAsync();
                    if (await r.ReadAsync())
                    {
                        totalIn = r.GetInt64(0);
                        totalOut = r.GetInt64(1);
                    }
                }

                await using (var cmd = new MySqlCommand(
                    @"SELECT framedipaddress, callingstationid, acctstarttime
                      FROM radacct WHERE username=@u AND acctstoptime IS NULL
                      ORDER BY acctstarttime DESC LIMIT 1", conn))
                {
                    cmd.Parameters.AddWithValue("@u", username);
                    await using var r = await cmd.ExecuteReaderAsync();
                    if (await r.ReadAsync())
                    {
                        framedIp = r.IsDBNull(0) ? null : r.GetString(0);
                        mac = r.IsDBNull(1) ? null : r.GetString(1);
                        sessionStart = r.IsDBNull(2) ? null : r.GetDateTime(2);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetUserUsage failed: {User}", username);
            }

            long sessionTotal = sessionIn + sessionOut;
            long grandTotal = totalIn + totalOut;

            return new
            {
                username,
                sessionInputBytes = sessionIn,
                sessionOutputBytes = sessionOut,
                sessionTotalBytes = sessionTotal,
                totalInputBytes = totalIn,
                totalOutputBytes = totalOut,
                totalBytes = grandTotal,
                sessionStart,
                framedIp,
                mac,
                sessionTotalHuman = FormatBytes(sessionTotal),
                totalHuman = FormatBytes(grandTotal)
            };
        }

        public async Task<string> GetRateLimit(string username)
        {
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();
                await using var cmd = new MySqlCommand(
                    "SELECT value FROM radreply WHERE username=@u AND attribute='Mikrotik-Rate-Limit' LIMIT 1",
                    conn);
                cmd.Parameters.AddWithValue("@u", username);
                var o = await cmd.ExecuteScalarAsync();
                return o == null ? null : o.ToString();
            }
            catch { return null; }
        }

        private static string FormatBytes(long bytes)
        {
            string[] u = { "B", "KB", "MB", "GB", "TB" };
            double v = bytes;
            int i = 0;
            while (v >= 1024 && i < u.Length - 1) { v /= 1024; i++; }
            return string.Format("{0:0.##} {1}", v, u[i]);
        }

public async Task<string> GetCleartextPassword(string username)
        {
            try
            {
                await using var conn = new MySqlConnection(_connectionString);
                await conn.OpenAsync();

                await using var cmd = new MySqlCommand(
                    @"SELECT value FROM radcheck 
                      WHERE username = @u AND attribute = 'Cleartext-Password'
                      LIMIT 1",
                    conn);
                cmd.Parameters.AddWithValue("@u", username);

                var result = await cmd.ExecuteScalarAsync();
                return result?.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetCleartextPassword failed: {User}", username);
                return null;
            }
        }

        // ========== تحديث السرعة + الإرجاع ==========
        public async Task<(bool Ok, string Rate)> UpdateSpeedWithRate(string username, string speed)
        {
            var rate = NormalizeSpeed(speed);
            var ok = await UpdateSpeed(username, speed);
            return (ok, rate);
        }
    }
}