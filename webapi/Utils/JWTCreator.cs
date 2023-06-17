using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using webapi.Entities;

namespace webapi.Utils
{
    public static class JWTCreator
    {
        public static string CreateToken(User user)
        {

            var claims = new List<Claim> { new Claim(ClaimTypes.Name, user.Login) };
            return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.Add(TimeSpan.FromDays(10))));
        }
    }
}
