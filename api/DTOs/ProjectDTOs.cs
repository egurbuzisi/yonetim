namespace IsYonetim.Api.DTOs;

public class ProjectDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public decimal? Budget { get; set; }
    public int? Progress { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int CreatedById { get; set; }
    public string? CreatedByName { get; set; }
    public List<int> VisibleTo { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public List<ProjectMessageDto> Messages { get; set; } = new();
}

public class ProjectMessageDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Image { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateProjectRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "planlanmis";
    public string Priority { get; set; } = "orta";
    public string Location { get; set; } = string.Empty;
    public decimal? Budget { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<int> VisibleTo { get; set; } = new();
}

public class UpdateProjectRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }
    public string? Priority { get; set; }
    public string? Location { get; set; }
    public decimal? Budget { get; set; }
    public int? Progress { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public List<int>? VisibleTo { get; set; }
}

public class AddProjectMessageRequest
{
    public string Message { get; set; } = string.Empty;
    public string? Image { get; set; }
}
