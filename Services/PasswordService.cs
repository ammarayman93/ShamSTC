using BCrypt.Net;
using System;
using BCryptNet = BCrypt.Net.BCrypt;

namespace ISPSystem.Services
{
    public class PasswordService
    {
        public string Hash(string password)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("Password cannot be empty");
            return BCryptNet.HashPassword(password);
        }

        public bool Verify(string password, string hash)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(hash))
                return false;

            try
            {
                return BCryptNet.Verify(password, hash);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Password verification error: {ex.Message}");
                return false;
            }
        }
    }
}