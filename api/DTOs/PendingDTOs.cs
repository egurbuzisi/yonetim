namespace IsYonetim.Api.DTOs;

public class PendingDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RequesterName { get; set; } = string.Empty;
    public string RequesterPhone { get; set; } = string.Empty;
    public string? RequesterEmail { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime? AppointmentDate { get; set; }
    public string? Note { get; set; }
    public int CreatedById { get; set; }
    public string? CreatedByName { get; set; }
    public int? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    public List<int> VisibleTo { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public int WaitingDays { get; set; }
}

public class CreatePendingRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RequesterName { get; set; } = string.Empty;
    public string RequesterPhone { get; set; } = string.Empty;
    public string? RequesterEmail { get; set; }
    public string Status { get; set; } = "beklemede";
    public string Priority { get; set; } = "orta";
    public string Category { get; set; } = "diger";
    public DateTime? AppointmentDate { get; set; }
    public string? Note { get; set; }
    public int? AssignedToId { get; set; }
    public List<int> VisibleTo { get; set; } = new();
}

public class UpdatePendingRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? RequesterName { get; set; }
    public string? RequesterPhone { get; set; }
    public string? RequesterEmail { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? Category { get; set; }
    public DateTime? AppointmentDate { get; set; }
    public string? Note { get; set; }
    public int? AssignedToId { get; set; }
    public List<int>? VisibleTo { get; set; }
}
