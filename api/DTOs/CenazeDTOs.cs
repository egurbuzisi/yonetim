namespace IsYonetim.Api.DTOs;

public class CenazeDto
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
    public string Status { get; set; } = string.Empty;
    public string? Note { get; set; }
    public int CreatedById { get; set; }
    public string? CreatedByName { get; set; }
    public List<int> VisibleTo { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class CreateCenazeRequest
{
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
    public string? Note { get; set; }
    public List<int> VisibleTo { get; set; } = new();
}

public class UpdateCenazeRequest
{
    public string? DeceasedName { get; set; }
    public int? Age { get; set; }
    public string? Gender { get; set; }
    public string? Mahalle { get; set; }
    public string? Address { get; set; }
    public string? ContactName { get; set; }
    public string? ContactPhone { get; set; }
    public DateTime? DeathDate { get; set; }
    public DateTime? FuneralDate { get; set; }
    public string? FuneralTime { get; set; }
    public string? Mosque { get; set; }
    public string? Cemetery { get; set; }
    public string? Status { get; set; }
    public string? Note { get; set; }
    public List<int>? VisibleTo { get; set; }
}
