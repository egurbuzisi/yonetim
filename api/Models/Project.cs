namespace IsYonetim.Api.Models;

public class Project
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "planlanmis"; // planlanmis, devam_ediyor, tamamlandi, iptal
    public string Priority { get; set; } = "orta"; // dusuk, orta, yuksek, acil
    public string Location { get; set; } = string.Empty;
    public decimal? Budget { get; set; }
    public int? Progress { get; set; } = 0;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public string VisibleTo { get; set; } = "[]"; // JSON array of user IDs
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<ProjectMessage> Messages { get; set; } = new List<ProjectMessage>();
}

public class ProjectMessage
{
    public int Id { get; set; }
    public int ProjectId { get; set; }
    public Project? Project { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Image { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
