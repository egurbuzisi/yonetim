using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IsYonetim.Api.Data;
using IsYonetim.Api.DTOs;
using BCrypt.Net;

namespace IsYonetim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        // İsmi normalize et
        var normalizedName = NormalizeName(request.Username);
        
        // Kullanıcıyı bul
        var user = await _context.Users
            .FirstOrDefaultAsync(u => 
                u.IsActive && 
                (NormalizeName(u.Name) == normalizedName || 
                 u.Email.ToLower() == request.Username.ToLower()));

        if (user == null)
        {
            return Ok(new LoginResponse { Success = false, Message = "Kullanıcı bulunamadı" });
        }

        // Şifre kontrolü
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Ok(new LoginResponse { Success = false, Message = "Şifre hatalı" });
        }

        return Ok(new LoginResponse
        {
            Success = true,
            Message = "Giriş başarılı",
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone,
                Role = user.Role,
                Department = user.Department,
                Avatar = user.Avatar
            }
        });
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        var users = await _context.Users
            .Where(u => u.IsActive)
            .OrderBy(u => u.Name)
            .Select(u => new UserDto
            {
                Id = u.Id,
                Name = u.Name,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role,
                Department = u.Department,
                Avatar = u.Avatar
            })
            .ToListAsync();

        return Ok(users);
    }

    private static string NormalizeName(string name)
    {
        return name
            .ToLower()
            .Replace('ı', 'i')
            .Replace('ğ', 'g')
            .Replace('ü', 'u')
            .Replace('ş', 's')
            .Replace('ö', 'o')
            .Replace('ç', 'c')
            .Replace('İ', 'i')
            .Replace('Ğ', 'g')
            .Replace('Ü', 'u')
            .Replace('Ş', 's')
            .Replace('Ö', 'o')
            .Replace('Ç', 'c')
            .Trim();
    }
}
