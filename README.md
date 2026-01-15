# Is Yonetim - Yildirim Belediyesi Is Takip Sistemi

Yildirim Belediyesi Is Takip ve Yonetim Uygulamasi

## Proje Yapisi

```
yonetim/
├── api/                  # .NET Backend Kaynak Kodu (C#)
│   ├── Controllers/      # API endpoint'leri
│   ├── Models/           # Veritabani modelleri
│   ├── DTOs/             # Veri transfer objeleri
│   ├── Data/             # DbContext ve Seeder
│   └── Program.cs        # Ana giris noktasi
│
├── frontend/             # React Frontend (TypeScript)
│   ├── src/
│   │   ├── components/   # React bileşenleri
│   │   ├── pages/        # Sayfa bileşenleri
│   │   ├── contexts/     # Auth ve Data context'leri
│   │   ├── services/     # API servisleri
│   │   └── types/        # TypeScript tipleri
│   └── package.json
│
├── messages-api/         # Node.js Mesajlaşma API'si
│   ├── server.js         # Express + WebSocket sunucu
│   ├── data/             # JSON veri dosyalari
│   └── package.json
│
├── dist/                 # Derlenmiş Backend (Çalıştırmak için)
│   └── IsYonetimAPI.dll
│
├── scripts/              # Yardımcı scriptler
│   ├── seed-projects.js
│   └── ...
│
├── start.bat             # Tek tıkla başlat (Windows)
└── README.md
```

## Teknolojiler

| Katman | Teknoloji | Port |
|--------|-----------|------|
| Backend API | .NET 9 / C# / Entity Framework / SQL Server | 5000 |
| Messages API | Node.js / Express / WebSocket | 5001 |
| Frontend | React 19 / TypeScript / Vite / Tailwind CSS | 5173 |

## Hizli Baslatma

### Windows (Tek Tik)
`start.bat` dosyasina çift tiklayin.

### Manuel Baslatma

1. **Backend (.NET):**
   ```bash
   cd dist
   dotnet IsYonetimAPI.dll
   ```

2. **Messages API (Node.js):**
   ```bash
   cd messages-api
   npm start
   ```

3. **Frontend (React):**
   ```bash
   cd frontend
   npm run dev
   ```

## Gelistirme

### Backend Gelistirme
```bash
cd api
dotnet restore
dotnet run
```

### Backend Publish (Derle)
```bash
cd api
dotnet publish -c Release -o ../dist
```

### Frontend Gelistirme
```bash
cd frontend
npm install
npm run dev
```

## Erisim

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Messages API:** http://localhost:5001/api

## Giris Bilgileri

| Kullanici | Sifre | Rol |
|-----------|-------|-----|
| Oktay Yilmaz | 123456 | Baskan |
| Merve Ekmekci | 123456 | Ozel Kalem |
| Ahmet Uslu | 123456 | Baskan Yardimcisi |

## Moduller

- **Projeler** - Proje takibi ve ilerleme
- **Gundem** - Gundem yonetimi
- **Bekleyen** - Bekleyen isler
- **Program** - Etkinlik takvimi
- **Cenaze** - Cenaze hizmetleri
- **Rapor** - Raporlama

## Yetki Sistemi

- **Baskan/Ozel Kalem:** Tum verileri gorur
- **Digerleri:** Sadece kendilerine paylasilan veya olusturdukları verileri gorur

## Veritabani

SQL Server kullanilir. Veritabani olusturma scripti:
```
api/SQL/CreateDatabase.sql (veya dist/SQL/CreateDatabase.sql)
```

## API Endpointleri

### Ana API (Port 5000)
- `POST /api/auth/login` - Giris
- `GET /api/projects` - Projeler
- `GET /api/agendas` - Gundemler
- `GET /api/pendings` - Bekleyenler
- `GET /api/schedules` - Program
- `GET /api/cenazes` - Cenazeler

### Messages API (Port 5001)
- `GET /api/messages/:projectId` - Proje mesajlari
- `GET /api/notifications/:userId` - Bildirimler
- `GET /api/staff` - Gorevliler
- `GET /api/contacts` - Kisiler
- `GET /api/project-tags` - Proje etiketleri
