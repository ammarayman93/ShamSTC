#nullable disable
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ISPSystem.Data;
using ISPSystem.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace ISPSystem.Services
{
    /// <summary>
    /// خدمة الاتصال بـ MikroTik API.
    /// تدعم جهاز افتراضي من الإعدادات + أجهزة متعددة من جدول MikroTikDevices
    /// (عبر VpnIp القادم من L2TP أو WireGuard).
    /// </summary>
    public class MikroTikService
    {
        private readonly string _host;
        private readonly string _username;
        private readonly string _password;
        private readonly int _port;
        private readonly int _timeout;
        private readonly bool _enabled;
        private readonly ILogger<MikroTikService> _logger;
        private readonly AppDbContext _db;

        public MikroTikService(
            IConfiguration config,
            ILogger<MikroTikService> logger,
            AppDbContext db)
        {
            // الجهاز الافتراضي من الإعدادات (للتوافق مع الكود القديم)
            _host = config["MikroTik:Ip"] ?? "127.0.0.1";
            _username = config["MikroTik:User"] ?? "admin";
            _password = config["MikroTik:Pass"] ?? "";
            _port = config.GetValue<int>("MikroTik:ApiPort", 8728);
            _timeout = config.GetValue<int>("MikroTik:Timeout", 10000);
            _enabled = config.GetValue<bool>("MikroTik:Enabled", true);
            _logger = logger;
            _db = db;
        }

        // =========================================================
        // سياق الاتصال (جهاز افتراضي أو جهاز محدد)
        // =========================================================

        private sealed class ConnInfo
        {
            public string Host { get; set; }
            public string Username { get; set; }
            public string Password { get; set; }
            public int Port { get; set; }
            public string Label { get; set; }
        }

        private ConnInfo DefaultConn() => new ConnInfo
        {
            Host = _host,
            Username = _username,
            Password = _password,
            Port = _port,
            Label = $"default({_host})"
        };

        private static ConnInfo FromDevice(MikroTikDevice d)
        {
            if (d == null) throw new ArgumentNullException(nameof(d));
            var host = !string.IsNullOrWhiteSpace(d.VpnIp) ? d.VpnIp : d.IpAddress;
            if (string.IsNullOrWhiteSpace(host))
                throw new Exception($"الجهاز {d.Name} لا يحتوي على VpnIp أو IpAddress");
            return new ConnInfo
            {
                Host = host.Trim(),
                Username = string.IsNullOrWhiteSpace(d.Username) ? "admin" : d.Username,
                Password = d.Password ?? "",
                Port = d.ApiPort > 0 ? d.ApiPort : 8728,
                Label = $"{d.Name}({host})"
            };
        }

        /// <summary>جلب جهاز من قاعدة البيانات حسب المعرف</summary>
        public async Task<MikroTikDevice> GetDeviceAsync(int deviceId)
        {
            var device = await _db.MikroTikDevices.FindAsync(deviceId);
            if (device == null)
                throw new Exception($"جهاز MikroTik رقم {deviceId} غير موجود");
            if (!device.IsEnabled)
                throw new Exception($"جهاز MikroTik {device.Name} معطل");
            return device;
        }

        /// <summary>جلب الجهاز المرتبط بالعميل، أو الافتراضي إن لم يُحدد</summary>
        public async Task<MikroTikDevice> GetDeviceForClientAsync(int? mikroTikServerId)
        {
            if (mikroTikServerId == null || mikroTikServerId <= 0)
                return null; // استخدم الافتراضي
            return await GetDeviceAsync(mikroTikServerId.Value);
        }

        // =========================================================
        // إنشاء اتصال جديد مع MikroTik
        // =========================================================

        private async Task<TcpClient> ConnectAsync(
            ConnInfo conn,
            CancellationToken cancellationToken = default)
        {
            if (!_enabled)
                throw new Exception("MikroTik API معطل من الإعدادات");

            var client = new TcpClient
            {
                ReceiveTimeout = _timeout,
                SendTimeout = _timeout
            };

            _logger.LogInformation(
                "Connecting to MikroTik {Label} {Host}:{Port}",
                conn.Label, conn.Host, conn.Port);

            using var timeoutCts =
                CancellationTokenSource.CreateLinkedTokenSource(
                    cancellationToken);

            timeoutCts.CancelAfter(_timeout);

            try
            {
                await client.ConnectAsync(
                    conn.Host,
                    conn.Port,
                    timeoutCts.Token);

                _logger.LogInformation(
                    "Connected successfully to MikroTik {Label}",
                    conn.Label);

                return client;
            }
            catch
            {
                client.Dispose();

                _logger.LogError(
                    "Failed to connect to MikroTik {Label} {Host}:{Port}",
                    conn.Label, conn.Host, conn.Port);

                throw;
            }
        }

        // =========================================================
        // MikroTik API Length Encoding
        // =========================================================

        private static async Task WriteLengthAsync(
            NetworkStream stream,
            int length,
            CancellationToken cancellationToken = default)
        {
            if (length < 0x80)
            {
                await stream.WriteAsync(
                    new[]
                    {
                        (byte)length
                    },
                    cancellationToken);

                return;
            }

            if (length < 0x4000)
            {
                var value = length | 0x8000;

                await stream.WriteAsync(
                    new[]
                    {
                        (byte)(value >> 8),
                        (byte)value
                    },
                    cancellationToken);

                return;
            }

            if (length < 0x200000)
            {
                var value = length | 0xC000;

                await stream.WriteAsync(
                    new[]
                    {
                        (byte)(value >> 16),
                        (byte)(value >> 8),
                        (byte)value
                    },
                    cancellationToken);

                return;
            }

            if (length < 0x10000000)
            {
                var value = length | 0xE0000000;

                await stream.WriteAsync(
                    new[]
                    {
                        (byte)(value >> 24),
                        (byte)(value >> 16),
                        (byte)(value >> 8),
                        (byte)value
                    },
                    cancellationToken);

                return;
            }

            await stream.WriteAsync(
                new byte[] { 0xF0 },
                cancellationToken);

            await stream.WriteAsync(
                BitConverter.GetBytes(length).Reverse().ToArray(),
                cancellationToken);
        }

        private static async Task<int> ReadLengthAsync(
            NetworkStream stream,
            CancellationToken cancellationToken = default)
        {
            var firstByte = await ReadByteAsync(
                stream,
                cancellationToken);

            if (firstByte < 0x80)
                return firstByte;

            if ((firstByte & 0xC0) == 0x80)
            {
                var secondByte = await ReadByteAsync(
                    stream,
                    cancellationToken);

                return ((firstByte & 0x3F) << 8)
                       | secondByte;
            }

            if ((firstByte & 0xE0) == 0xC0)
            {
                var secondByte = await ReadByteAsync(
                    stream,
                    cancellationToken);

                var thirdByte = await ReadByteAsync(
                    stream,
                    cancellationToken);

                return ((firstByte & 0x1F) << 16)
                       | (secondByte << 8)
                       | thirdByte;
            }

            if ((firstByte & 0xF0) == 0xE0)
            {
                var secondByte = await ReadByteAsync(
                    stream,
                    cancellationToken);

                var thirdByte = await ReadByteAsync(
                    stream,
                    cancellationToken);

                var fourthByte = await ReadByteAsync(
                    stream,
                    cancellationToken);

                return ((firstByte & 0x0F) << 24)
                       | (secondByte << 16)
                       | (thirdByte << 8)
                       | fourthByte;
            }

            if (firstByte == 0xF0)
            {
                var bytes = new byte[4];

                await ReadExactlyAsync(
                    stream,
                    bytes,
                    cancellationToken);

                return (bytes[0] << 24)
                       | (bytes[1] << 16)
                       | (bytes[2] << 8)
                       | bytes[3];
            }

            throw new Exception(
                $"Invalid MikroTik API length byte: {firstByte}");
        }

        private static async Task<byte> ReadByteAsync(
            NetworkStream stream,
            CancellationToken cancellationToken)
        {
            var buffer = new byte[1];

            await ReadExactlyAsync(
                stream,
                buffer,
                cancellationToken);

            return buffer[0];
        }

        private static async Task ReadExactlyAsync(
            NetworkStream stream,
            byte[] buffer,
            CancellationToken cancellationToken)
        {
            var offset = 0;

            while (offset < buffer.Length)
            {
                var read = await stream.ReadAsync(
                    buffer.AsMemory(
                        offset,
                        buffer.Length - offset),
                    cancellationToken);

                if (read == 0)
                    throw new IOException(
                        "MikroTik closed the connection unexpectedly");

                offset += read;
            }
        }

        // =========================================================
        // كتابة Word
        // =========================================================

        private static async Task WriteWordAsync(
            NetworkStream stream,
            string word,
            CancellationToken cancellationToken = default)
        {
            var data = Encoding.UTF8.GetBytes(word);

            await WriteLengthAsync(
                stream,
                data.Length,
                cancellationToken);

            await stream.WriteAsync(
                data,
                cancellationToken);
        }

        // =========================================================
        // إرسال Sentence
        // =========================================================

        private static async Task WriteSentenceAsync(
            NetworkStream stream,
            IEnumerable<string> words,
            CancellationToken cancellationToken = default)
        {
            foreach (var word in words)
            {
                await WriteWordAsync(
                    stream,
                    word,
                    cancellationToken);
            }

            // نهاية الـ Sentence
            await stream.WriteAsync(
                new byte[] { 0 },
                cancellationToken);
        }

        // =========================================================
        // قراءة Sentence
        // =========================================================

        private static async Task<List<string>> ReadSentenceAsync(
            NetworkStream stream,
            CancellationToken cancellationToken = default)
        {
            var words = new List<string>();

            while (true)
            {
                var length = await ReadLengthAsync(
                    stream,
                    cancellationToken);

                if (length == 0)
                    break;

                var buffer = new byte[length];

                await ReadExactlyAsync(
                    stream,
                    buffer,
                    cancellationToken);

                words.Add(
                    Encoding.UTF8.GetString(buffer));
            }

            return words;
        }

        // =========================================================
        // قراءة Response كامل
        // =========================================================

        private async Task<List<List<string>>> ReadResponseAsync(
            NetworkStream stream,
            CancellationToken cancellationToken = default)
        {
            var response = new List<List<string>>();

            while (true)
            {
                var sentence = await ReadSentenceAsync(
                    stream,
                    cancellationToken);

                response.Add(sentence);

                var firstWord =
                    sentence.FirstOrDefault();

                if (firstWord == "!done"
                    || firstWord == "!trap"
                    || firstWord == "!fatal")
                {
                    break;
                }
            }

            return response;
        }

        // =========================================================
        // تنفيذ أمر MikroTik
        // =========================================================

        private async Task<List<List<string>>> ExecuteCommandAsync(
            ConnInfo conn,
            params string[] words)
        {
            using var client =
                await ConnectAsync(conn);

            using var stream =
                client.GetStream();

            using var timeoutCts =
                new CancellationTokenSource(
                    _timeout);

            // تسجيل الدخول
            await WriteSentenceAsync(
                stream,
                new[]
                {
                    "/login",
                    $"=name={conn.Username}",
                    $"=password={conn.Password}"
                },
                timeoutCts.Token);

            var loginResponse =
                await ReadResponseAsync(
                    stream,
                    timeoutCts.Token);

            if (ContainsTrap(loginResponse))
            {
                var error =
                    GetTrapMessage(loginResponse);

                throw new Exception(
                    $"فشل تسجيل الدخول إلى MikroTik {conn.Label}: {error}");
            }

            var loginDone =
                loginResponse.Any(
                    x => x.FirstOrDefault() == "!done");

            if (!loginDone)
            {
                throw new Exception(
                    $"فشل تسجيل الدخول إلى MikroTik {conn.Label}");
            }

            // تنفيذ الأمر
            await WriteSentenceAsync(
                stream,
                words,
                timeoutCts.Token);

            var response =
                await ReadResponseAsync(
                    stream,
                    timeoutCts.Token);

            if (ContainsTrap(response))
            {
                var error =
                    GetTrapMessage(response);

                throw new Exception(
                    $"MikroTik API Error ({conn.Label}): {error}");
            }

            return response;
        }

        /// <summary>تنفيذ أمر على الجهاز الافتراضي (للتوافق)</summary>
        private Task<List<List<string>>> ExecuteCommandAsync(params string[] words)
            => ExecuteCommandAsync(DefaultConn(), words);

        /// <summary>تنفيذ أمر على جهاز محدد من قاعدة البيانات</summary>
        private async Task<List<List<string>>> ExecuteOnDeviceAsync(
            MikroTikDevice device,
            params string[] words)
        {
            var conn = device == null ? DefaultConn() : FromDevice(device);
            return await ExecuteCommandAsync(conn, words);
        }

        private async Task<List<List<string>>> ExecuteOnDeviceIdAsync(
            int? deviceId,
            params string[] words)
        {
            if (deviceId == null || deviceId <= 0)
                return await ExecuteCommandAsync(DefaultConn(), words);

            var device = await GetDeviceAsync(deviceId.Value);
            return await ExecuteOnDeviceAsync(device, words);
        }

        // =========================================================
        // Helpers
        // =========================================================

        private static bool ContainsTrap(
            List<List<string>> response)
        {
            return response.Any(
                sentence =>
                    sentence.FirstOrDefault()
                    == "!trap");
        }

        private static string GetTrapMessage(
            List<List<string>> response)
        {
            var trap =
                response.FirstOrDefault(
                    x => x.FirstOrDefault()
                         == "!trap");

            if (trap == null)
                return "Unknown MikroTik error";

            var message =
                trap.FirstOrDefault(
                    x => x.StartsWith("=message="));

            if (message != null)
                return message.Substring(
                    "=message=".Length);

            return string.Join(
                " ",
                trap);
        }

        private static Dictionary<string, string>
            ParseSentence(
                List<string> sentence)
        {
            var result =
                new Dictionary<string, string>(
                    StringComparer.OrdinalIgnoreCase);

            foreach (var word in sentence)
            {
                if (!word.StartsWith("="))
                    continue;

                var index =
                    word.IndexOf(
                        '=',
                        1);

                if (index <= 0)
                    continue;

                var key =
                    word.Substring(
                        1,
                        index - 1);

                var value =
                    word.Substring(
                        index + 1);

                result[key] = value;
            }

            return result;
        }

        private static List<Dictionary<string, string>>
            GetDataRows(
                List<List<string>> response)
        {
            return response
                .Where(
                    x => x.FirstOrDefault()
                         == "!re")
                .Select(ParseSentence)
                .ToList();
        }

        // =========================================================
        // الحصول على ID الحقيقي للمستخدم
        // =========================================================

        private async Task<string> GetPppSecretIdAsync(
            string username,
            ConnInfo conn = null)
        {
            conn ??= DefaultConn();
            var response =
                await ExecuteCommandAsync(
                    conn,
                    "/ppp/secret/print",
                    $"?name={username}",
                    "=.proplist=.id");

            var rows =
                GetDataRows(response);

            var row =
                rows.FirstOrDefault();

            if (row == null)
                return null;

            return row.TryGetValue(
                ".id",
                out var id)
                ? id
                : null;
        }

        // =========================================================
        // واجهة متعددة الأجهزة (L2TP / WireGuard / Direct)
        // device = null → الجهاز الافتراضي من الإعدادات
        // =========================================================

        public async Task<List<ActiveUser>> GetActiveUsers(MikroTikDevice device)
        {
            var conn = device == null ? DefaultConn() : FromDevice(device);
            return await GetActiveUsersInternal(conn);
        }

        public async Task<List<ActiveUser>> GetActiveUsersByDeviceId(int deviceId)
        {
            var device = await GetDeviceAsync(deviceId);
            return await GetActiveUsers(device);
        }

        /// <summary>جلب المستخدمين النشطين من كل الأجهزة المفعّلة</summary>
        public async Task<List<(MikroTikDevice Device, List<ActiveUser> Users, string Error)>> GetActiveUsersAllDevices()
        {
            var devices = await _db.MikroTikDevices.Where(d => d.IsEnabled).ToListAsync();
            var results = new List<(MikroTikDevice, List<ActiveUser>, string)>();

            // إذا لا يوجد أجهزة في الجدول، استخدم الافتراضي
            if (devices.Count == 0)
            {
                try
                {
                    var users = await GetActiveUsersInternal(DefaultConn());
                    results.Add((null, users, null));
                }
                catch (Exception ex)
                {
                    results.Add((null, new List<ActiveUser>(), ex.Message));
                }
                return results;
            }

            foreach (var d in devices)
            {
                try
                {
                    var users = await GetActiveUsers(d);
                    results.Add((d, users, null));
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "فشل جلب Active من {Name}", d.Name);
                    results.Add((d, new List<ActiveUser>(), ex.Message));
                }
            }
            return results;
        }

        // =========================================================
        // 1. المستخدمون النشطون (الجهاز الافتراضي)
        // =========================================================

        public async Task<List<ActiveUser>>
            GetActiveUsers()
        {
            return await GetActiveUsersInternal(DefaultConn());
        }

        private async Task<List<ActiveUser>> GetActiveUsersInternal(ConnInfo conn)
        {
            var users =
                new List<ActiveUser>();

            try
            {
                var response =
                    await ExecuteCommandAsync(
                        conn,
                        "/ppp/active/print",
                        "=.proplist=name,address,uptime,caller-id,service,bytes-in,bytes-out");

                var rows =
                    GetDataRows(response);

                foreach (var row in rows)
                {
                    users.Add(
                        new ActiveUser
                        {
                            Name = GetValue(row, "name"),
                            Address = GetValue(row, "address"),
                            Uptime = GetValue(row, "uptime"),
                            CallerId = GetValue(row, "caller-id"),
                            Service = GetValue(row, "service"),
                            BytesIn = ParseLong(GetValue(row, "bytes-in")),
                            BytesOut = ParseLong(GetValue(row, "bytes-out"))
                        });
                }

                _logger.LogInformation(
                    "Found {Count} active MikroTik users on {Label}",
                    users.Count, conn.Label);

                return users;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while getting active MikroTik users on {Label}",
                    conn.Label);

                throw;
            }
        }

        // =========================================================
        // 1b. فصل الجلسة النشطة (Kick) — ضروري عند الإيقاف أو تغيير السرعة
        // =========================================================

        public async Task<bool> KickActiveUser(string username, MikroTikDevice device = null)
        {
            if (string.IsNullOrWhiteSpace(username))
                return false;

            var conn = device == null ? DefaultConn() : FromDevice(device);

            try
            {
                var response = await ExecuteCommandAsync(
                    conn,
                    "/ppp/active/print",
                    $"?name={username}");

                var rows = GetDataRows(response);
                bool anyKicked = false;

                foreach (var row in rows)
                {
                    if (!row.TryGetValue(".id", out var id) || string.IsNullOrEmpty(id))
                        continue;

                    var removeResp = await ExecuteCommandAsync(
                        conn,
                        "/ppp/active/remove",
                        $"=.id={id}");

                    if (IsDone(removeResp))
                    {
                        anyKicked = true;
                        _logger.LogInformation(
                            "Kicked active MikroTik session for {Username} on {Label} (id={Id})",
                            username, conn.Label, id);
                    }
                }

                return anyKicked || rows.Count == 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error kicking active MikroTik user {Username} on {Label}",
                    username, conn.Label);
                return false;
            }
        }

        public async Task<bool> KickActiveUserByDeviceId(string username, int deviceId)
        {
            var device = await GetDeviceAsync(deviceId);
            return await KickActiveUser(username, device);
        }

        /// <summary>
        /// هل المستخدم متصل حالياً على المايكروتيك؟
        /// </summary>
        public async Task<bool> IsUserActive(string username)
        {
            try
            {
                var users = await GetActiveUsers();
                return users.Any(u =>
                    string.Equals(u.Name, username, StringComparison.OrdinalIgnoreCase));
            }
            catch
            {
                return false;
            }
        }

        // =========================================================
        // 2. جميع مستخدمي PPP
        // =========================================================

        public async Task<List<PppUser>>
            GetAllPppUsers(MikroTikDevice device = null)
        {
            var conn = device == null ? DefaultConn() : FromDevice(device);
            var users =
                new List<PppUser>();

            try
            {
                var response =
                    await ExecuteCommandAsync(
                        conn,
                        "/ppp/secret/print");

                var rows =
                    GetDataRows(response);

                foreach (var row in rows)
                {
                    users.Add(
                        new PppUser
                        {
                            Name = GetValue(
                                row,
                                "name"),

                            Profile = GetValue(
                                row,
                                "profile"),

                            Comment = GetValue(
                                row,
                                "comment"),

                            Disabled =
                                GetValue(
                                    row,
                                    "disabled")
                                .Equals(
                                    "true",
                                    StringComparison.OrdinalIgnoreCase)
                        });
                }

                return users;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error while getting PPP users on {Label}",
                    conn.Label);

                throw;
            }
        }

        public async Task<List<PppUser>> GetAllPppUsersByDeviceId(int deviceId)
        {
            var device = await GetDeviceAsync(deviceId);
            return await GetAllPppUsers(device);
        }

        // =========================================================
        // 3. إضافة مستخدم PPP
        // =========================================================

        public async Task<bool>
            AddPppUser(
                string username,
                string password,
                string profile,
                string comment = "",
                MikroTikDevice device = null)
        {
            var conn = device == null ? DefaultConn() : FromDevice(device);
            try
            {
                var response =
                    await ExecuteCommandAsync(
                        conn,
                        "/ppp/secret/add",
                        $"=name={username}",
                        $"=password={password}",
                        $"=profile={profile}",
                        $"=comment={comment}",
                        "=disabled=no");

                return IsDone(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error adding PPP user {Username} on {Label}",
                    username, conn.Label);

                return false;
            }
        }

        public async Task<bool> AddPppUserByDeviceId(
            string username, string password, string profile, string comment, int deviceId)
        {
            var device = await GetDeviceAsync(deviceId);
            return await AddPppUser(username, password, profile, comment, device);
        }

        // =========================================================
        // 4. حذف مستخدم
        // =========================================================

        public async Task<bool>
            RemovePppUser(
                string username,
                MikroTikDevice device = null)
        {
            var conn = device == null ? DefaultConn() : FromDevice(device);
            try
            {
                var id =
                    await GetPppSecretIdAsync(
                        username, conn);

                if (string.IsNullOrEmpty(id))
                {
                    _logger.LogWarning(
                        "PPP user {Username} not found on {Label}",
                        username, conn.Label);

                    return false;
                }

                var response =
                    await ExecuteCommandAsync(
                        conn,
                        "/ppp/secret/remove",
                        $"=.id={id}");

                return IsDone(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error removing PPP user {Username} on {Label}",
                    username, conn.Label);

                return false;
            }
        }

        public async Task<bool> RemovePppUserByDeviceId(string username, int deviceId)
        {
            var device = await GetDeviceAsync(deviceId);
            return await RemovePppUser(username, device);
        }

        // =========================================================
        // 5. تعطيل مستخدم
        // =========================================================

        public async Task<bool>
            DisablePppUser(
                string username,
                MikroTikDevice device = null)
        {
            var conn = device == null ? DefaultConn() : FromDevice(device);
            try
            {
                var id =
                    await GetPppSecretIdAsync(
                        username, conn);

                if (string.IsNullOrEmpty(id))
                    return false;

                var response =
                    await ExecuteCommandAsync(
                        conn,
                        "/ppp/secret/disable",
                        $"=.id={id}");

                // فصل الجلسة النشطة إن وُجدت
                await KickActiveUser(username, device);

                return IsDone(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error disabling PPP user {Username} on {Label}",
                    username, conn.Label);

                return false;
            }
        }

        public async Task<bool> DisablePppUserByDeviceId(string username, int deviceId)
        {
            var device = await GetDeviceAsync(deviceId);
            return await DisablePppUser(username, device);
        }

        // =========================================================
        // 6. تفعيل مستخدم
        // =========================================================

        public async Task<bool>
            EnablePppUser(
                string username,
                MikroTikDevice device = null)
        {
            var conn = device == null ? DefaultConn() : FromDevice(device);
            try
            {
                var id =
                    await GetPppSecretIdAsync(
                        username, conn);

                if (string.IsNullOrEmpty(id))
                    return false;

                var response =
                    await ExecuteCommandAsync(
                        conn,
                        "/ppp/secret/enable",
                        $"=.id={id}");

                return IsDone(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error enabling PPP user {Username} on {Label}",
                    username, conn.Label);

                return false;
            }
        }

        public async Task<bool> EnablePppUserByDeviceId(string username, int deviceId)
        {
            var device = await GetDeviceAsync(deviceId);
            return await EnablePppUser(username, device);
        }

        // =========================================================
        // 7. تغيير السرعة
        // =========================================================

        public async Task<bool>
            UpdateUserSpeed(
                string username,
                string newProfile,
                MikroTikDevice device = null)
        {
            var conn = device == null ? DefaultConn() : FromDevice(device);
            try
            {
                var id =
                    await GetPppSecretIdAsync(
                        username, conn);

                if (string.IsNullOrEmpty(id))
                    return false;

                var response =
                    await ExecuteCommandAsync(
                        conn,
                        "/ppp/secret/set",
                        $"=.id={id}",
                        $"=profile={newProfile}");

                // فصل الجلسة لتطبيق البروفايل الجديد
                if (IsDone(response))
                    await KickActiveUser(username, device);

                return IsDone(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error updating speed for PPP user {Username} on {Label}",
                    username, conn.Label);

                return false;
            }
        }

        public async Task<bool> UpdateUserSpeedByDeviceId(string username, string newProfile, int deviceId)
        {
            var device = await GetDeviceAsync(deviceId);
            return await UpdateUserSpeed(username, newProfile, device);
        }

        // =========================================================
        // 8. حظر IP
        // =========================================================

        public async Task<bool>
            BlockUserByAddress(
                string address,
                string comment = "Blocked by ISP System",
                MikroTikDevice device = null)
        {
            var conn = device == null ? DefaultConn() : FromDevice(device);
            try
            {
                var response =
                    await ExecuteCommandAsync(
                        conn,
                        "/ip/firewall/address-list/add",
                        "=list=blocked",
                        $"=address={address}",
                        $"=comment={comment}");

                return IsDone(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error blocking IP {Address} on {Label}",
                    address, conn.Label);

                return false;
            }
        }

        // =========================================================
        // 9. إلغاء حظر IP
        // =========================================================

        public async Task<bool>
            UnblockUserByAddress(
                string address,
                MikroTikDevice device = null)
        {
            var conn = device == null ? DefaultConn() : FromDevice(device);
            try
            {
                var response =
                    await ExecuteCommandAsync(
                        conn,
                        "/ip/firewall/address-list/print",
                        $"?address={address}",
                        "=.proplist=.id,address");

                var rows =
                    GetDataRows(response);

                var row =
                    rows.FirstOrDefault();

                if (row == null)
                    return false;

                if (!row.TryGetValue(
                        ".id",
                        out var id))
                {
                    return false;
                }

                var removeResponse =
                    await ExecuteCommandAsync(
                        conn,
                        "/ip/firewall/address-list/remove",
                        $"=.id={id}");

                return IsDone(removeResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error unblocking IP {Address} on {Label}",
                    address, conn.Label);

                return false;
            }
        }

        // =========================================================
        // 10. إضافة PPP Profile
        // =========================================================

        public async Task<bool>
            AddProfile(
                string name,
                string rateLimit,
                string parentQueue = "none",
                MikroTikDevice device = null)
        {
            var conn = device == null ? DefaultConn() : FromDevice(device);
            try
            {
                var response =
                    await ExecuteCommandAsync(
                        conn,
                        "/ppp/profile/add",
                        $"=name={name}",
                        $"=rate-limit={rateLimit}");

                return IsDone(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error adding PPP profile {Profile} on {Label}",
                    name, conn.Label);

                return false;
            }
        }

        public async Task<bool> AddProfileByDeviceId(string name, string rateLimit, int deviceId, string parentQueue = "none")
        {
            var device = await GetDeviceAsync(deviceId);
            return await AddProfile(name, rateLimit, parentQueue, device);
        }

        // =========================================================
        // Helpers
        // =========================================================

        private static bool IsDone(
            List<List<string>> response)
        {
            return response.Any(
                x => x.FirstOrDefault()
                     == "!done");
        }

        private static string GetValue(
            Dictionary<string, string> row,
            string key)
        {
            return row.TryGetValue(
                key,
                out var value)
                ? value
                : string.Empty;
        }

        private static long ParseLong(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return 0;
            // MikroTik قد يعيد أرقاماً مع مسافات أو وحدات
            var cleaned = value.Trim()
                .Replace(" ", "")
                .Replace(",", "")
                .Replace("i", "", StringComparison.OrdinalIgnoreCase);
            // إن وُجدت لاحقة Ki/Mi
            double mult = 1;
            if (cleaned.EndsWith("Ki", StringComparison.OrdinalIgnoreCase))
            { mult = 1024; cleaned = cleaned[..^2]; }
            else if (cleaned.EndsWith("Mi", StringComparison.OrdinalIgnoreCase))
            { mult = 1024 * 1024; cleaned = cleaned[..^2]; }
            else if (cleaned.EndsWith("Gi", StringComparison.OrdinalIgnoreCase))
            { mult = 1024.0 * 1024 * 1024; cleaned = cleaned[..^2]; }

            if (long.TryParse(cleaned, System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out var result))
                return result;
            if (double.TryParse(cleaned, System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out var d))
                return (long)(d * mult);
            return 0;
        }

        /// <summary>Ping من المايكروتيك إلى IP معيّن</summary>
        public async Task<object> PingAsync(string address, int count = 4)
        {
            if (string.IsNullOrWhiteSpace(address))
                throw new Exception("عنوان IP مطلوب");

            count = Math.Clamp(count, 1, 10);

            var response = await ExecuteCommandAsync(
                "/ping",
                $"=address={address}",
                $"=count={count}");

            var rows = GetDataRows(response);
            var replies = new List<object>();
            int received = 0;
            double totalMs = 0;

            foreach (var row in rows)
            {
                var time = GetValue(row, "time");
                var status = GetValue(row, "status");
                var seq = GetValue(row, "seq");
                var ttl = GetValue(row, "ttl");
                // time مثل 12ms
                double ms = 0;
                if (!string.IsNullOrEmpty(time))
                {
                    var t = time.Replace("ms", "").Replace("us", "").Trim();
                    double.TryParse(t, System.Globalization.NumberStyles.Any,
                        System.Globalization.CultureInfo.InvariantCulture, out ms);
                    if (time.Contains("us")) ms /= 1000.0;
                    received++;
                    totalMs += ms;
                }
                replies.Add(new { seq, time, status, ttl, ms });
            }

            var sent = count;
            var loss = sent > 0 ? Math.Round((1.0 - (double)received / sent) * 100, 1) : 100;

            return new
            {
                address,
                sent,
                received,
                packetLossPercent = loss,
                avgMs = received > 0 ? Math.Round(totalMs / received, 2) : (double?)null,
                replies
            };
        }

        /// <summary>إحصاء ARP تقريبي مرتبط بعنوان العميل (غالباً 1 على PPPoE)</summary>
        public async Task<int> CountArpNearAsync(string ip)
        {
            if (string.IsNullOrWhiteSpace(ip)) return 0;
            try
            {
                var response = await ExecuteCommandAsync("/ip/arp/print");
                var rows = GetDataRows(response);
                // نفس الـ IP أو نفس الـ /24
                var parts = ip.Split('.');
                string prefix = parts.Length >= 3 ? $"{parts[0]}.{parts[1]}.{parts[2]}." : ip;
                int n = 0;
                foreach (var row in rows)
                {
                    var addr = GetValue(row, "address") ?? "";
                    if (addr == ip || addr.StartsWith(prefix))
                        n++;
                }
                return n;
            }
            catch
            {
                return 0;
            }
        }

        /// <summary>قراءة سرعة لحظية على واجهة (إن وُجدت)</summary>
        public async Task<(long rxBps, long txBps, string iface)> TryMonitorTrafficAsync(string username)
        {
            // أسماء شائعة لواجهات PPP
            var candidates = new[]
            {
                $"<pppoe-{username}>",
                $"pppoe-{username}",
                username
            };
            // إن كان username فيه @ خذ الجزء الأول
            if (username.Contains("@"))
            {
                var shortName = username.Split('@')[0];
                candidates = new[]
                {
                    $"<pppoe-{username}>",
                    $"<pppoe-{shortName}>",
                    $"pppoe-{shortName}",
                    shortName,
                    username
                };
            }

            foreach (var iface in candidates)
            {
                try
                {
                    var response = await ExecuteCommandAsync(
                        "/interface/monitor-traffic",
                        $"=interface={iface}",
                        "=once=");
                    var rows = GetDataRows(response);
                    var row = rows.FirstOrDefault();
                    if (row == null) continue;
                    var rx = ParseLong(GetValue(row, "rx-bits-per-second"));
                    var tx = ParseLong(GetValue(row, "tx-bits-per-second"));
                    if (rx > 0 || tx > 0)
                        return (rx, tx, iface);
                }
                catch
                {
                    // جرب الاسم التالي
                }
            }
            return (0, 0, "");
        }

        public ActiveUser FindActiveUser(List<ActiveUser> list, string username)
        {
            if (list == null || string.IsNullOrEmpty(username)) return null;
            foreach (var u in list)
            {
                if (string.IsNullOrEmpty(u.Name)) continue;
                var a = u.Name; var b = username;
                var as_ = a.Contains("@") ? a.Split('@')[0] : a;
                var bs = b.Contains("@") ? b.Split('@')[0] : b;
                if (string.Equals(a, b, StringComparison.OrdinalIgnoreCase)
                    || string.Equals(as_, bs, StringComparison.OrdinalIgnoreCase)
                    || string.Equals(as_, b, StringComparison.OrdinalIgnoreCase)
                    || string.Equals(a, bs, StringComparison.OrdinalIgnoreCase))
                    return u;
            }
            return null;
        }
    } // end MikroTikService

    // =========================================================
    // Models
    // =========================================================

    public class ActiveUser
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string Uptime { get; set; }
        public string CallerId { get; set; }
        public string Service { get; set; }
        public long BytesIn { get; set; }
        public long BytesOut { get; set; }
    }

    public class PppUser
    {
        public string Name { get; set; }

        public string Profile { get; set; }

        public bool Disabled { get; set; }

        public string Comment { get; set; }
    }
}