using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IsYonetim.Api.Data;
using IsYonetim.Api.Models;
using IsYonetim.Api.DTOs;
using System.Text.Json;

namespace IsYonetim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CenazesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CenazesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<CenazeDto>>> GetAll()
    {
        var cenazes = await _context.Cenazes
            .Include(c => c.CreatedBy)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(cenazes.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CenazeDto>> GetById(int id)
    {
        var cenaze = await _context.Cenazes
            .Include(c => c.CreatedBy)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cenaze == null) return NotFound();

        return Ok(MapToDto(cenaze));
    }

    [HttpPost]
    public async Task<ActionResult<CenazeDto>> Create([FromBody] CreateCenazeRequest request)
    {
        var cenaze = new Cenaze
        {
            DeceasedName = request.DeceasedName,
            Age = request.Age,
            Gender = request.Gender,
            Mahalle = request.Mahalle,
            Address = request.Address,
            ContactName = request.ContactName,
            ContactPhone = request.ContactPhone,
            DeathDate = request.DeathDate,
            FuneralDate = request.FuneralDate,
            FuneralTime = request.FuneralTime,
            Mosque = request.Mosque,
            Cemetery = request.Cemetery,
            Note = request.Note,
            CreatedById = request.VisibleTo.FirstOrDefault(),
            VisibleTo = JsonSerializer.Serialize(request.VisibleTo)
        };

        _context.Cenazes.Add(cenaze);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = cenaze.Id }, MapToDto(cenaze));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CenazeDto>> Update(int id, [FromBody] UpdateCenazeRequest request)
    {
        var cenaze = await _context.Cenazes.FindAsync(id);
        if (cenaze == null) return NotFound();

        if (request.DeceasedName != null) cenaze.DeceasedName = request.DeceasedName;
        if (request.Age.HasValue) cenaze.Age = request.Age;
        if (request.Gender != null) cenaze.Gender = request.Gender;
        if (request.Mahalle != null) cenaze.Mahalle = request.Mahalle;
        if (request.Address != null) cenaze.Address = request.Address;
        if (request.ContactName != null) cenaze.ContactName = request.ContactName;
        if (request.ContactPhone != null) cenaze.ContactPhone = request.ContactPhone;
        if (request.DeathDate.HasValue) cenaze.DeathDate = request.DeathDate;
        if (request.FuneralDate.HasValue) cenaze.FuneralDate = request.FuneralDate;
        if (request.FuneralTime != null) cenaze.FuneralTime = request.FuneralTime;
        if (request.Mosque != null) cenaze.Mosque = request.Mosque;
        if (request.Cemetery != null) cenaze.Cemetery = request.Cemetery;
        if (request.Status != null) cenaze.Status = request.Status;
        if (request.Note != null) cenaze.Note = request.Note;
        if (request.VisibleTo != null) cenaze.VisibleTo = JsonSerializer.Serialize(request.VisibleTo);
        cenaze.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(cenaze));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var cenaze = await _context.Cenazes.FindAsync(id);
        if (cenaze == null) return NotFound();

        _context.Cenazes.Remove(cenaze);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static CenazeDto MapToDto(Cenaze c)
    {
        return new CenazeDto
        {
            Id = c.Id,
            DeceasedName = c.DeceasedName,
            Age = c.Age,
            Gender = c.Gender,
            Mahalle = c.Mahalle,
            Address = c.Address,
            ContactName = c.ContactName,
            ContactPhone = c.ContactPhone,
            DeathDate = c.DeathDate,
            FuneralDate = c.FuneralDate,
            FuneralTime = c.FuneralTime,
            Mosque = c.Mosque,
            Cemetery = c.Cemetery,
            Status = c.Status,
            Note = c.Note,
            CreatedById = c.CreatedById,
            CreatedByName = c.CreatedBy?.Name,
            VisibleTo = JsonSerializer.Deserialize<List<int>>(c.VisibleTo) ?? new(),
            CreatedAt = c.CreatedAt
        };
    }
}
