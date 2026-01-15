namespace IsYonetim.Api.Models;

public class Cenaze
{
    public int Id { get; set; }
    public string DeceasedName { get; set; } = string.Empty;
    public int? Age { get; set; }
    public string? Gender { get; set; }
    public string Mahalle { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? ContactName { get; set; }
    public string? ContactPhone { get; set; }
    public DateTime? DeathDate { get; set; }
    public DateTime? FuneralDate { get; set; }
    public string? FuneralTime { get; set; }
    public string? Mosque { get; set; }
    public string? Cemetery { get; set; }
    public string Status { get; set; } = "beklemede"; // beklemede, hazirlaniyor, tamamlandi
    public string? Note { get; set; }
    public int CreatedById { get; set; }
    public User? CreatedBy { get; set; }
    public string VisibleTo { get; set; } = "[]"; // JSON array of user IDs
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
