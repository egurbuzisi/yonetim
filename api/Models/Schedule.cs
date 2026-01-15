namespace IsYonetim.Api.Models;

public class Schedule
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = "planlanmis"; // planlanmis, devam_ediyor, tamamlandi, iptal
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public bool IsAllDay { get; set; } = false;
    public string? Color { get; set; }
    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public string VisibleTo { get; set; } = "[]"; // JSON array of user IDs
    public string Participants { get; set; } = "[]"; // JSON array of user IDs
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
