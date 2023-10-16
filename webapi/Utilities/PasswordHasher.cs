namespace webapi.Utilities
{
    public static class PasswordHasher
    {
        public static string GenerateSalt()
        {
            string salt = BCrypt.Net.BCrypt.GenerateSalt(12);
            return salt;
        }
        public static string HashPassword(string password, string salt)
        {
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password, salt);
            return hashedPassword;
        }

        public static bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}
