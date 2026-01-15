namespace IsYonetim.Api.DTOs;

public class ScheduleDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAllDay { get; set; }
    public string? Color { get; set; }
    public int CreatedById { get; set; }
    public string? CreatedByName { get; set; }
    public List<int> VisibleTo { get; set; } = new();
    public List<int> Participants { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class CreateScheduleRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAllDay { get; set; }
    public string? Color { get; set; }
    public List<int> VisibleTo { get; set; } = new();
    public List<int> Participants { get; set; } = new();
}

public class UpdateScheduleRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Location { get; set; }
    public string? Status { get; set; }
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public bool? IsAllDay { get; set; }
    public string? Color { get; set; }
    public List<int>? VisibleTo { get; set; }
    public List<int>? Participants { get; set; }
}
