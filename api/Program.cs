using Microsoft.EntityFrameworkCore;
using IsYonetim.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Initialize Database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        context.Database.EnsureCreated();
        DbSeeder.SeedData(context);
        Console.WriteLine("✅ Veritabanı hazır");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Veritabanı bağlantı hatası: {ex.Message}");
        Console.WriteLine("ℹ️ SQL Server bağlantısını kontrol edin veya LocalDB kullanın");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Static files for frontend
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// SPA fallback
app.MapFallbackToFile("index.html");

Console.WriteLine(@"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 İş Yönetim API Sunucusu Çalışıyor                        ║
║                                                               ║
║   📍 http://localhost:5000                                    ║
║   📚 Swagger: http://localhost:5000/swagger                   ║
║   💾 Veritabanı: SQL Server                                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
");

app.Run();
