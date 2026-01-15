using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IsYonetim.Api.Data;
using IsYonetim.Api.Models;
using IsYonetim.Api.DTOs;
using System.Text.Json;

namespace IsYonetim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SchedulesController : ControllerBase
{
    private readonly AppDbContext _context;

    public SchedulesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ScheduleDto>>> GetAll()
    {
        var schedules = await _context.Schedules
            .Include(s => s.CreatedBy)
            .OrderBy(s => s.StartTime)
            .ToListAsync();

        return Ok(schedules.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ScheduleDto>> GetById(int id)
    {
        var schedule = await _context.Schedules
            .Include(s => s.CreatedBy)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (schedule == null) return NotFound();

        return Ok(MapToDto(schedule));
    }

    [HttpPost]
    public async Task<ActionResult<ScheduleDto>> Create([FromBody] CreateScheduleRequest request)
    {
        var schedule = new Schedule
        {
            Title = request.Title,
            Description = request.Description,
            Location = request.Location,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            IsAllDay = request.IsAllDay,
            Color = request.Color,
            CreatedById = request.VisibleTo.FirstOrDefault(),
            VisibleTo = JsonSerializer.Serialize(request.VisibleTo),
            Participants = JsonSerializer.Serialize(request.Participants)
        };

        _context.Schedules.Add(schedule);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = schedule.Id }, MapToDto(schedule));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ScheduleDto>> Update(int id, [FromBody] UpdateScheduleRequest request)
    {
        var schedule = await _context.Schedules.FindAsync(id);
        if (schedule == null) return NotFound();

        if (request.Title != null) schedule.Title = request.Title;
        if (request.Description != null) schedule.Description = request.Description;
        if (request.Location != null) schedule.Location = request.Location;
        if (request.Status != null) schedule.Status = request.Status;
        if (request.StartTime.HasValue) schedule.StartTime = request.StartTime.Value;
        if (request.EndTime.HasValue) schedule.EndTime = request.EndTime.Value;
        if (request.IsAllDay.HasValue) schedule.IsAllDay = request.IsAllDay.Value;
        if (request.Color != null) schedule.Color = request.Color;
        if (request.VisibleTo != null) schedule.VisibleTo = JsonSerializer.Serialize(request.VisibleTo);
        if (request.Participants != null) schedule.Participants = JsonSerializer.Serialize(request.Participants);
        schedule.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(schedule));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var schedule = await _context.Schedules.FindAsync(id);
        if (schedule == null) return NotFound();

        _context.Schedules.Remove(schedule);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ScheduleDto MapToDto(Schedule s)
    {
        return new ScheduleDto
        {
            Id = s.Id,
            Title = s.Title,
            Description = s.Description,
            Location = s.Location,
            Status = s.Status,
            StartTime = s.StartTime,
            EndTime = s.EndTime,
            IsAllDay = s.IsAllDay,
            Color = s.Color,
            CreatedById = s.CreatedById,
            CreatedByName = s.CreatedBy?.Name,
            VisibleTo = JsonSerializer.Deserialize<List<int>>(s.VisibleTo) ?? new(),
            Participants = JsonSerializer.Deserialize<List<int>>(s.Participants) ?? new(),
            CreatedAt = s.CreatedAt
        };
    }
}
