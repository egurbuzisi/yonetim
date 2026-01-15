using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IsYonetim.Api.Data;
using IsYonetim.Api.Models;
using IsYonetim.Api.DTOs;
using System.Text.Json;

namespace IsYonetim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PendingsController : ControllerBase
{
    private readonly AppDbContext _context;

    public PendingsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<PendingDto>>> GetAll()
    {
        var pendings = await _context.Pendings
            .Include(p => p.CreatedBy)
            .Include(p => p.AssignedTo)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(pendings.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PendingDto>> GetById(int id)
    {
        var pending = await _context.Pendings
            .Include(p => p.CreatedBy)
            .Include(p => p.AssignedTo)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (pending == null) return NotFound();

        return Ok(MapToDto(pending));
    }

    [HttpPost]
    public async Task<ActionResult<PendingDto>> Create([FromBody] CreatePendingRequest request)
    {
        var pending = new Pending
        {
            Title = request.Title,
            Description = request.Description,
            RequesterName = request.RequesterName,
            RequesterPhone = request.RequesterPhone,
            RequesterEmail = request.RequesterEmail,
            Status = request.Status,
            Priority = request.Priority,
            Category = request.Category,
            AppointmentDate = request.AppointmentDate,
            Note = request.Note,
            AssignedToId = request.AssignedToId,
            CreatedById = request.VisibleTo.FirstOrDefault(),
            VisibleTo = JsonSerializer.Serialize(request.VisibleTo)
        };

        _context.Pendings.Add(pending);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = pending.Id }, MapToDto(pending));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PendingDto>> Update(int id, [FromBody] UpdatePendingRequest request)
    {
        var pending = await _context.Pendings.FindAsync(id);
        if (pending == null) return NotFound();

        if (request.Title != null) pending.Title = request.Title;
        if (request.Description != null) pending.Description = request.Description;
        if (request.RequesterName != null) pending.RequesterName = request.RequesterName;
        if (request.RequesterPhone != null) pending.RequesterPhone = request.RequesterPhone;
        if (request.RequesterEmail != null) pending.RequesterEmail = request.RequesterEmail;
        if (request.Status != null) pending.Status = request.Status;
        if (request.Priority != null) pending.Priority = request.Priority;
        if (request.Category != null) pending.Category = request.Category;
        if (request.AppointmentDate.HasValue) pending.AppointmentDate = request.AppointmentDate;
        if (request.Note != null) pending.Note = request.Note;
        if (request.AssignedToId.HasValue) pending.AssignedToId = request.AssignedToId;
        if (request.VisibleTo != null) pending.VisibleTo = JsonSerializer.Serialize(request.VisibleTo);
        pending.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(pending));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var pending = await _context.Pendings.FindAsync(id);
        if (pending == null) return NotFound();

        _context.Pendings.Remove(pending);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static PendingDto MapToDto(Pending p)
    {
        return new PendingDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            RequesterName = p.RequesterName,
            RequesterPhone = p.RequesterPhone,
            RequesterEmail = p.RequesterEmail,
            Status = p.Status,
            Priority = p.Priority,
            Category = p.Category,
            AppointmentDate = p.AppointmentDate,
            Note = p.Note,
            CreatedById = p.CreatedById,
            CreatedByName = p.CreatedBy?.Name,
            AssignedToId = p.AssignedToId,
            AssignedToName = p.AssignedTo?.Name,
            VisibleTo = JsonSerializer.Deserialize<List<int>>(p.VisibleTo) ?? new(),
            CreatedAt = p.CreatedAt,
            WaitingDays = (int)(DateTime.UtcNow - p.CreatedAt).TotalDays
        };
    }
}
