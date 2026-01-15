namespace IsYonetim.Api.Models;

public class Pending
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RequesterName { get; set; } = string.Empty;
    public string RequesterPhone { get; set; } = string.Empty;
    public string? RequesterEmail { get; set; }
    public string Status { get; set; } = "beklemede"; // beklemede, islemde, tamamlandi, reddedildi
    public string Priority { get; set; } = "orta"; // dusuk, orta, yuksek, acil
    public string Category { get; set; } = "diger"; // randevu, talep, sikayet, diger
    public DateTime? AppointmentDate { get; set; }
    public string? Note { get; set; }
    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public int? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }
    public string VisibleTo { get; set; } = "[]"; // JSON array of user IDs
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
