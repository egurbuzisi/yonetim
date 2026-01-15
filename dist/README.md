# İş Yönetim Sistemi - Backend API

Yıldırım Belediyesi İş Takip Sistemi - .NET + SQL Server Backend

## 🚀 Teknolojiler

- **ASP.NET Core 9.0**
- **Entity Framework Core**
- **SQL Server**
- **BCrypt** (Şifre hashleme)

## 📋 Modüller

- Projeler - Proje takibi
- Gündemler - Gündem yönetimi
- Bekleyenler - Talep/randevu takibi
- Program - Günlük/haftalık program
- Cenazeler - Cenaze takip sistemi
- Bildirimler - Kullanıcı bildirimleri

## ⚙️ Kurulum

### Gereksinimler
- .NET Runtime 9.0
- SQL Server (Express veya üstü)

### Başlatma

1. `appsettings.json` dosyasında SQL bağlantısını ayarlayın
2. `BASLAT.bat` dosyasını çalıştırın

## 🔐 Giriş Bilgileri

Şifre: `11223344` (tüm kullanıcılar)

- Oktay Yılmaz (Başkan)
- Merve Ekmekci (Özel Kalem)
- Ahmet Uslu (Başkan Yardımcısı)

## 📡 API

Base URL: `http://localhost:5000/api`

| Endpoint | Açıklama |
|----------|----------|
| POST /api/auth/login | Giriş |
| GET /api/users | Kullanıcılar |
| GET/POST/PUT/DELETE /api/projects | Projeler |
| GET/POST/PUT/DELETE /api/agendas | Gündemler |
| GET/POST/PUT/DELETE /api/pendings | Bekleyenler |
| GET/POST/PUT/DELETE /api/schedules | Program |
| GET/POST/PUT/DELETE /api/cenazes | Cenazeler |
