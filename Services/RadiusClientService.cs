using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ISPSystem.Models;

namespace ISPSystem.Services
{
    public class RadiusClientService
    {
        private readonly RadiusServerConfig _config;
        private readonly ILogger<RadiusClientService> _logger;

        public RadiusClientService(IOptions<RadiusServerConfig> config, ILogger<RadiusClientService> logger)
        {
            _config = config.Value;
            _logger = logger;
        }

        public async Task<RadiusResponse> AuthenticateAsync(
            string username,
            string password,
            string nasIp = null,
            string macAddress = null)
        {
            try
            {
                var request = CreateAuthRequest(username, password, nasIp, macAddress);
                var response = await SendRadiusRequestAsync(request);

                var attributes = new Dictionary<string, string>();
                foreach (var attr in response.Attributes)
                    attributes[attr.Key.ToString()] = attr.Value;

                return new RadiusResponse
                {
                    Success = response.Code == RadiusCode.AccessAccept,
                    Code = response.Code.ToString(),
                    Message = response.Code == RadiusCode.AccessAccept
                        ? "Authentication successful"
                        : "Authentication failed",
                    Attributes = attributes
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "RADIUS authentication error");
                return new RadiusResponse
                {
                    Success = false,
                    Code = "Error",
                    Message = $"Connection error: {ex.Message}",
                    Attributes = new Dictionary<string, string>()
                };
            }
        }

        private RadiusPacket CreateAuthRequest(string username, string password, string? nasIp, string? macAddress)
        {
            var authenticator = new byte[16];
            RandomNumberGenerator.Fill(authenticator);

            var packet = new RadiusPacket
            {
                Code = RadiusCode.AccessRequest,
                Identifier = (byte)Random.Shared.Next(0, 256),
                Authenticator = authenticator,
                Attributes = new Dictionary<byte, string>()
            };

            packet.Attributes[1] = username; // User-Name

            // User-Password ÌÃ»  ‘›Ì—Â »ÿ—Ìﬁ… PAP
            packet.Attributes[2] = EncryptPapPassword(password, authenticator, _config.Secret);

            if (!string.IsNullOrEmpty(nasIp))
                packet.Attributes[4] = nasIp; // NAS-IP-Address

            if (!string.IsNullOrEmpty(macAddress))
                packet.Attributes[31] = macAddress; // Calling-Station-Id

            packet.Attributes[6] = "1"; // Service-Type = Login
            packet.Attributes[7] = "1"; // Framed-Protocol = PPP

            return packet;
        }

        private static string EncryptPapPassword(string password, byte[] authenticator, string secret)
        {
            var secretBytes = Encoding.ASCII.GetBytes(secret);
            var passwordBytes = Encoding.ASCII.GetBytes(password);

            // ÌÃ» √‰ ÌﬂÊ‰ ÿÊ· ﬂ·„… «·„—Ê— „÷«⁄›« ·‹ 16
            var paddedLength = ((passwordBytes.Length + 15) / 16) * 16;
            var padded = new byte[paddedLength];
            Array.Copy(passwordBytes, padded, passwordBytes.Length);

            var result = new byte[paddedLength];
            var previous = authenticator;

            using var md5 = MD5.Create();

            for (int i = 0; i < paddedLength; i += 16)
            {
                var hashInput = secretBytes.Concat(previous).ToArray();
                var hash = md5.ComputeHash(hashInput);

                for (int j = 0; j < 16; j++)
                    result[i + j] = (byte)(padded[i + j] ^ hash[j]);

                previous = result.Skip(i).Take(16).ToArray();
            }

            // ‰—Ã⁄Â« ﬂ‹ Base64 „ƒﬁ « (”Ì „  ÕÊÌ·Â« ·»«Ì «  ›Ì ToBytes)
            return Convert.ToBase64String(result);
        }

        private async Task<RadiusPacket> SendRadiusRequestAsync(RadiusPacket request)
        {
            using var client = new UdpClient();
            client.Connect(_config.Host, _config.Port);
            client.Client.ReceiveTimeout = _config.Timeout * 1000;

            var requestBytes = request.ToBytes(_config.Secret);
            await client.SendAsync(requestBytes, requestBytes.Length);

            var receiveTask = client.ReceiveAsync();
            var timeoutTask = Task.Delay(_config.Timeout * 1000);

            if (await Task.WhenAny(receiveTask, timeoutTask) == timeoutTask)
                throw new TimeoutException("RADIUS server did not respond");

            var result = await receiveTask;
            return RadiusPacket.FromBytes(result.Buffer);
        }
    }

    public enum RadiusCode : byte
    {
        AccessRequest = 1,
        AccessAccept = 2,
        AccessReject = 3,
        AccountingRequest = 4,
        AccountingResponse = 5,
        AccessChallenge = 11
    }

    public class RadiusPacket
    {
        public RadiusCode Code { get; set; }
        public byte Identifier { get; set; }
        public byte[] Authenticator { get; set; } = new byte[16];
        public Dictionary<byte, string> Attributes { get; set; } = new ();

        public byte[] ToBytes(string secret)
        {
            using var ms = new MemoryStream();
            using var writer = new BinaryWriter(ms);

            writer.Write((byte)Code);
            writer.Write(Identifier);
            writer.Write((ushort)0); // placeholder for length
            writer.Write(Authenticator);

            foreach (var attr in Attributes)
            {
                byte[] valueBytes;

                if (attr.Key == 2) // User-Password („‘›— „”»ﬁ«)
                    valueBytes = Convert.FromBase64String(attr.Value);
                else
                    valueBytes = Encoding.ASCII.GetBytes(attr.Value);

                writer.Write(attr.Key);
                writer.Write((byte)(valueBytes.Length + 2));
                writer.Write(valueBytes);
            }

            var bytes = ms.ToArray();

            // Length ÌÃ» √‰ ÌﬂÊ‰ Big-Endian (Network order)
            var length = (ushort)bytes.Length;
            bytes[2] = (byte)(length >> 8);
            bytes[3] = (byte)(length & 0xFF);

            return bytes;
        }

        public static RadiusPacket FromBytes(byte[] bytes)
        {
            var packet = new RadiusPacket();
            using var ms = new MemoryStream(bytes);
            using var reader = new BinaryReader(ms);

            packet.Code = (RadiusCode)reader.ReadByte();
            packet.Identifier = reader.ReadByte();

            // Length is big-endian
            var lengthHigh = reader.ReadByte();
            var lengthLow = reader.ReadByte();
            var length = (lengthHigh << 8) | lengthLow;

            packet.Authenticator = reader.ReadBytes(16);

            while (ms.Position < length)
            {
                var type = reader.ReadByte();
                var attrLength = reader.ReadByte();
                var value = reader.ReadBytes(attrLength - 2);
                packet.Attributes[type] = Encoding.ASCII.GetString(value);
            }

            return packet;
        }
    }

    public class RadiusResponse
    {
        public bool Success { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public Dictionary<string, string> Attributes { get; set; } = new ();
    }
}