namespace IsYonetim.Api.DTOs;

public class AgendaDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime? MeetingDate { get; set; }
    public string? Decision { get; set; }
    public int CreatedById { get; set; }
    public string? CreatedByName { get; set; }
    public List<int> VisibleTo { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public List<AgendaMessageDto> Messages { get; set; } = new();
}

public class AgendaMessageDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateAgendaRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "beklemede";
    public string Priority { get; set; } = "orta";
    public DateTime? MeetingDate { get; set; }
    public List<int> VisibleTo { get; set; } = new();
}

public class UpdateAgendaRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public DateTime? MeetingDate { get; set; }
    public string? Decision { get; set; }
    public List<int>? VisibleTo { get; set; }
}
