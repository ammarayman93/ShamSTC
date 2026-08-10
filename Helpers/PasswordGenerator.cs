using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ISPSystem.Helpers
{
    public static class PasswordGenerator
    {
        public static string Generate(int length = 8)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
