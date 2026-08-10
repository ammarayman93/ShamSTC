using System;
using System.Security.Cryptography;

namespace ISPSystem.Services
{
    public static class RandomPasswordService
    {
        private static readonly Random _random = new Random();

        public static string GeneratePassword(int length = 5)
        {
            const string numbers = "0123456789";
            var password = new char[length];

            for (int i = 0; i < length; i++)
            {
                password[i] = numbers[_random.Next(numbers.Length)];
            }

            return new string(password);
        }

        public static string GenerateRandomMacAddress()
        {
            var random = new Random();
            var macBytes = new byte[6];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(macBytes);
            }
            macBytes[0] = (byte)((macBytes[0] & 0xFE) | 0x02);
            return string.Join(":", Array.ConvertAll(macBytes, b => b.ToString("X2")));
        }

        public static string GenerateRandomIpAddress(string subnet = "10.126.211.")
        {
            var random = new Random();
            var lastOctet = random.Next(2, 254);
            return $"{subnet}{lastOctet}";
        }
    }
}