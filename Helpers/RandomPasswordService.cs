using System;
using System.Linq;

namespace ISPSystem.Helpers
{
    public static class RandomPasswordService
    {
        private static readonly Random _random = new Random();

        public static string GeneratePassword(int length = 8)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[_random.Next(s.Length)]).ToArray());
        }

        public static string GenerateRandomMacAddress()
        {
            var bytes = new byte[6];
            _random.NextBytes(bytes);
            bytes[0] = (byte)((bytes[0] | 0x02) & 0xFE);
            return string.Join(":", bytes.Select(b => b.ToString("X2")));
        }

        public static string GenerateRandomIpAddress()
        {
            return $"10.{_random.Next(0, 255)}.{_random.Next(0, 255)}.{_random.Next(2, 254)}";
        }
    }
}