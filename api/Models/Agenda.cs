namespace IsYonetim.Api.Models;

public class Agenda
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "beklemede"; // beklemede, gorusuldu, karara_baglandi, ertelendi
    public string Priority { get; set; } = "orta"; // dusuk, orta, yuksek, acil
    public DateTime? MeetingDate { get; set; }
    public string? Decision { get; set; }
    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public string VisibleTo { get; set; } = "[]"; // JSON array of user IDs
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<AgendaMessage> Messages { get; set; } = new List<AgendaMessage>();
}

public class AgendaMessage
{
    public int Id { get; set; }
    public int AgendaId { get; set; }
    public Agenda? Agenda { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
