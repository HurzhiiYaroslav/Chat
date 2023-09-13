namespace webapi.Utilities
{
    public static class Validator
    {
        public static bool Password(string? password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                return false;
            }
            if (password.Length < 4) 
            {
                return false;
            }
            if (password.Equals("null", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
            return true;
        }
    }
}
