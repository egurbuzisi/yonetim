# İş Yönetim Sistemi

Yıldırım Belediyesi İş Takip ve Yönetim Uygulaması

## Klasör Yapısı

```
IsYonetimFinal/
├── backend/          # .NET API (port 5000)
├── frontend/         # React Uygulaması (port 5173)
├── start.bat         # Tek tıkla başlat
└── README.md
```

## Başlatma

### Kolay Yol
`start.bat` dosyasına çift tıklayın.

### Manuel
1. Backend:
   ```
   cd backend
   dotnet IsYonetimAPI.dll
   ```

2. Frontend:
   ```
   cd frontend
   npm run dev
   ```

## Erişim

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## Giriş Bilgileri

| Kullanıcı | Şifre | Rol |
|-----------|-------|-----|
| Oktay Yılmaz | 123456 | Başkan |
| Merve Ekmekci | 123456 | Özel Kalem |
| Ahmet Uslu | 123456 | Başkan Yardımcısı |

## Modüller

- **Projeler** - Proje takibi ve ilerleme
- **Gündem** - Gündem yönetimi
- **Bekleyen** - Bekleyen işler
- **Program** - Etkinlik takvimi
- **Cenaze** - Cenaze hizmetleri
- **Rapor** - Raporlama

## Yetki Sistemi

- **Başkan/Özel Kalem:** Tüm verileri görür
- **Diğerleri:** Sadece kendilerine paylaşılan veya oluşturdukları verileri görür
