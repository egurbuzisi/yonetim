using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IsYonetim.Api.Data;
using IsYonetim.Api.Models;
using IsYonetim.Api.DTOs;
using System.Text.Json;

namespace IsYonetim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgendasController : ControllerBase
{
    private readonly AppDbContext _context;

    public AgendasController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<AgendaDto>>> GetAll()
    {
        var agendas = await _context.Agendas
            .Include(a => a.CreatedBy)
            .Include(a => a.Messages)
                .ThenInclude(m => m.User)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(agendas.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<AgendaDto>> GetById(int id)
    {
        var agenda = await _context.Agendas
            .Include(a => a.CreatedBy)
            .Include(a => a.Messages)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (agenda == null) return NotFound();

        return Ok(MapToDto(agenda));
    }

    [HttpPost]
    public async Task<ActionResult<AgendaDto>> Create([FromBody] CreateAgendaRequest request)
    {
        var agenda = new Agenda
        {
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            MeetingDate = request.MeetingDate,
            CreatedById = request.VisibleTo.FirstOrDefault(),
            VisibleTo = JsonSerializer.Serialize(request.VisibleTo)
        };

        _context.Agendas.Add(agenda);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = agenda.Id }, MapToDto(agenda));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<AgendaDto>> Update(int id, [FromBody] UpdateAgendaRequest request)
    {
        var agenda = await _context.Agendas.FindAsync(id);
        if (agenda == null) return NotFound();

        if (request.Title != null) agenda.Title = request.Title;
        if (request.Description != null) agenda.Description = request.Description;
        if (request.Status != null) agenda.Status = request.Status;
        if (request.Priority != null) agenda.Priority = request.Priority;
        if (request.MeetingDate.HasValue) agenda.MeetingDate = request.MeetingDate;
        if (request.Decision != null) agenda.Decision = request.Decision;
        if (request.VisibleTo != null) agenda.VisibleTo = JsonSerializer.Serialize(request.VisibleTo);
        agenda.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(agenda));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var agenda = await _context.Agendas.FindAsync(id);
        if (agenda == null) return NotFound();

        _context.Agendas.Remove(agenda);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static AgendaDto MapToDto(Agenda a)
    {
        return new AgendaDto
        {
            Id = a.Id,
            Title = a.Title,
            Description = a.Description,
            Status = a.Status,
            Priority = a.Priority,
            MeetingDate = a.MeetingDate,
            Decision = a.Decision,
            CreatedById = a.CreatedById,
            CreatedByName = a.CreatedBy?.Name,
            VisibleTo = JsonSerializer.Deserialize<List<int>>(a.VisibleTo) ?? new(),
            CreatedAt = a.CreatedAt,
            Messages = a.Messages.Select(m => new AgendaMessageDto
            {
                Id = m.Id,
                UserId = m.UserId,
                UserName = m.User?.Name ?? "Bilinmeyen",
                Message = m.Message,
                CreatedAt = m.CreatedAt
            }).ToList()
        };
    }
}
