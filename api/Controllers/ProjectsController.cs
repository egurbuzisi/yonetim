using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using IsYonetim.Api.Data;
using IsYonetim.Api.Models;
using IsYonetim.Api.DTOs;
using System.Text.Json;

namespace IsYonetim.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProjectDto>>> GetAll()
    {
        var projects = await _context.Projects
            .Include(p => p.CreatedBy)
            .Include(p => p.Messages)
                .ThenInclude(m => m.User)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(projects.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProjectDto>> GetById(int id)
    {
        var project = await _context.Projects
            .Include(p => p.CreatedBy)
            .Include(p => p.Messages)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null) return NotFound();

        return Ok(MapToDto(project));
    }

    [HttpPost]
    public async Task<ActionResult<ProjectDto>> Create([FromBody] CreateProjectRequest request)
    {
        var project = new Project
        {
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            Location = request.Location,
            Budget = request.Budget,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            CreatedById = request.VisibleTo.FirstOrDefault(),
            VisibleTo = JsonSerializer.Serialize(request.VisibleTo)
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = project.Id }, MapToDto(project));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProjectDto>> Update(int id, [FromBody] UpdateProjectRequest request)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();

        if (request.Title != null) project.Title = request.Title;
        if (request.Description != null) project.Description = request.Description;
        if (request.Status != null) project.Status = request.Status;
        if (request.Priority != null) project.Priority = request.Priority;
        if (request.Location != null) project.Location = request.Location;
        if (request.Budget.HasValue) project.Budget = request.Budget;
        if (request.Progress.HasValue) project.Progress = request.Progress;
        if (request.StartDate.HasValue) project.StartDate = request.StartDate;
        if (request.EndDate.HasValue) project.EndDate = request.EndDate;
        if (request.VisibleTo != null) project.VisibleTo = JsonSerializer.Serialize(request.VisibleTo);
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToDto(project));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/messages")]
    public async Task<ActionResult<ProjectMessageDto>> AddMessage(int id, [FromBody] AddProjectMessageRequest request)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();

        var message = new ProjectMessage
        {
            ProjectId = id,
            UserId = 1, // TODO: Get from auth
            Message = request.Message,
            Image = request.Image
        };

        _context.ProjectMessages.Add(message);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(message.UserId);

        return Ok(new ProjectMessageDto
        {
            Id = message.Id,
            UserId = message.UserId,
            UserName = user?.Name ?? "Bilinmeyen",
            Message = message.Message,
            Image = message.Image,
            CreatedAt = message.CreatedAt
        });
    }

    private static ProjectDto MapToDto(Project p)
    {
        return new ProjectDto
        {
            Id = p.Id,
            Title = p.Title,
            Description = p.Description,
            Status = p.Status,
            Priority = p.Priority,
            Location = p.Location,
            Budget = p.Budget,
            Progress = p.Progress,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            CreatedById = p.CreatedById,
            CreatedByName = p.CreatedBy?.Name,
            VisibleTo = JsonSerializer.Deserialize<List<int>>(p.VisibleTo) ?? new(),
            CreatedAt = p.CreatedAt,
            Messages = p.Messages.Select(m => new ProjectMessageDto
            {
                Id = m.Id,
                UserId = m.UserId,
                UserName = m.User?.Name ?? "Bilinmeyen",
                Message = m.Message,
                Image = m.Image,
                CreatedAt = m.CreatedAt
            }).ToList()
        };
    }
}
