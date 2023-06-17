using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.EntityFrameworkCore;
using System;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using System.Text;
using webapi;
using webapi.Entities;
using System.Xml.Linq;
using System.Net;
using webapi.Hubs;
using webapi.Utils;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore.ValueGeneration;
using System.Collections;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationContext>();
builder.Services.AddSignalR();
builder.Services.AddAuthorization();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "MyAuthServer",
            ValidateAudience = true,
            ValidAudience = "MyAuthClient",
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("mysupersecret_secretkey!123")),
            ValidateIssuerSigningKey = true,

        };
    });
builder.Services.AddCors();

var app = builder.Build();

app.UseDefaultFiles();

app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseCors(builder => builder.AllowAnyOrigin()
                            .AllowAnyHeader()
                            .AllowAnyMethod());

app.UseAuthentication();

app.UseAuthorization();




app.MapGet("/", async (ApplicationContext db) => await db.Users.ToListAsync());

app.MapPost("/login", async (AuthData AuthData, ApplicationContext db) => {
    User? user = await db.Users.FirstOrDefaultAsync(p => p.Login == AuthData.Login && p.Password == AuthData.Password);
    if (user is null) return Results.Unauthorized();
    var response = new
    {
        access_token = JWTCreator.CreateToken(user),
        username = user.Id
    };
    return Results.Json(response);
});

app.MapPost("/register", async (RegisterData RegisterData, ApplicationContext db) => {
    if(await db.Users.AnyAsync(p => p.Login == RegisterData.Login))
    {
        return Results.Conflict();
    }
    else
    {
        User u = new User { Name = RegisterData.Username, Login = RegisterData.Login, Password = RegisterData.Password, Photo = RegisterData.PhotoPath };
        await db.Users.AddAsync(u);
        await db.SaveChangesAsync();
        var response = new
        {
            access_token = JWTCreator.CreateToken(u),
            username = u.Id

        };
        return Results.Json(response);
    }
});

app.MapPost("/setPhoto", async (IFormFileCollection form) =>
{
    var image = form["image"];
    if (image != null && image.Length > 0)
    {
        string fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
        string filePath = Path.Combine("wwwroot/Images", fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }
        var response = new
        {
            photoName = fileName
        };
        return Results.Json(response);
    }

    return Results.Conflict();
});
app.MapGet("/checkAuth", [Authorize] () =>
{
    return Results.Ok();
});

app.MapHub<ChatHub>("/chat");

app.Run();

record class RegisterData(string Username, string Login, string Password,string PhotoPath);
record class AuthData ( string Login, string Password);