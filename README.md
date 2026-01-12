# İş Yönetim API (.NET + SQL Server)

Yıldırım Belediyesi İş Takip Sistemi Backend API

## 🚀 Teknolojiler

- **ASP.NET Core 9.0**
- **Entity Framework Core**
- **SQL Server**
- **BCrypt** (Şifre hashleme)

## 📋 Modüller

- **Projeler** - Proje takibi ve yönetimi
- **Gündemler** - Günlük gündem yönetimi
- **Bekleyenler** - Bekleyen işler/talepler
- **Program** - Günlük/haftalık/aylık program
- **Cenazeler** - Cenaze takip sistemi
- **Bildirimler** - Kullanıcı bildirimleri

## ⚙️ Kurulum

### Gereksinimler
- .NET Runtime 9.0
- SQL Server (Express veya üstü)

### Başlatma

1. `appsettings.json` dosyasında SQL Server bağlantısını ayarlayın:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=IsYonetimDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
```

2. Uygulamayı başlatın:
```bash
# Windows
BASLAT.bat

# veya
dotnet IsYonetimAPI.dll --urls "http://localhost:5000"
```

## 📡 API Endpoints

| Modül | Endpoint | Açıklama |
|-------|----------|----------|
| Auth | `POST /api/auth/login` | Kullanıcı girişi |
| Users | `GET /api/users` | Tüm kullanıcılar |
| Projects | `GET/POST/PUT/DELETE /api/projects` | Proje CRUD |
| Agendas | `GET/POST/PUT/DELETE /api/agendas` | Gündem CRUD |
| Pendings | `GET/POST/PUT/DELETE /api/pendings` | Bekleyen CRUD |
| Schedules | `GET/POST/PUT/DELETE /api/schedules` | Program CRUD |
| Cenazes | `GET/POST/PUT/DELETE /api/cenazes` | Cenaze CRUD |
| Notifications | `GET/POST /api/notifications` | Bildirim CRUD |

## 🔐 Varsayılan Kullanıcılar

Şifre: `11223344` (tüm kullanıcılar için)

- Oktay Yılmaz (Başkan)
- Merve Ekmekci (Özel Kalem)
- Ahmet Uslu (Başkan Yardımcısı)
- Gökhan Yıldız (Başkan Yardımcısı)
- Kamil Kanbur (Başkan Yardımcısı)

## 📁 Dosya Yapısı

```
sunucu_dotnet/
├── IsYonetimAPI.dll          # Ana uygulama
├── IsYonetimAPI.exe          # Windows çalıştırıcı
├── appsettings.json          # Ayarlar
├── web.config                # IIS ayarları
├── BASLAT.bat                # Hızlı başlat
├── SQL/
│   └── CreateDatabase.sql    # Veritabanı scripti
└── runtimes/                 # Platform bağımlılıkları
```

## 📄 Lisans

Bu proje Yıldırım Belediyesi için geliştirilmiştir.
