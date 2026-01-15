-- =============================================
-- YILDIRIM BELEDİYESİ İŞ TAKİP SİSTEMİ
-- SQL Server Veritabanı Oluşturma Script'i
-- =============================================

-- Veritabanını oluştur
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'IsYonetimDB')
BEGIN
    CREATE DATABASE IsYonetimDB;
END
GO

USE IsYonetimDB;
GO

-- =============================================
-- KULLANICILAR TABLOSU
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(100) NOT NULL,
        Role NVARCHAR(50) NOT NULL,
        Avatar NVARCHAR(255) NULL,
        Mahalle NVARCHAR(100) NULL,
        PasswordHash NVARCHAR(255) NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- PROJELER TABLOSU
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Projects')
BEGIN
    CREATE TABLE Projects (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Title NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        Status NVARCHAR(50) DEFAULT 'planlandi',
        Priority NVARCHAR(50) DEFAULT 'orta',
        Progress INT DEFAULT 0,
        StartDate DATETIME NULL,
        EndDate DATETIME NULL,
        CreatedBy INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProjectAssignments')
BEGIN
    CREATE TABLE ProjectAssignments (
        Id INT PRIMARY KEY IDENTITY(1,1),
        ProjectId INT NOT NULL,
        UserId INT NOT NULL,
        AssignedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProjectVisibilities')
BEGIN
    CREATE TABLE ProjectVisibilities (
        Id INT PRIMARY KEY IDENTITY(1,1),
        ProjectId INT NOT NULL,
        UserId INT NOT NULL,
        FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE
    );
END
GO

-- =============================================
-- GÜNDEMLER TABLOSU
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Agendas')
BEGIN
    CREATE TABLE Agendas (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Title NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        Status NVARCHAR(50) DEFAULT 'bekliyor',
        Priority NVARCHAR(50) DEFAULT 'orta',
        Date DATETIME NULL,
        CreatedBy INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AgendaAssignments')
BEGIN
    CREATE TABLE AgendaAssignments (
        Id INT PRIMARY KEY IDENTITY(1,1),
        AgendaId INT NOT NULL,
        UserId INT NOT NULL,
        FOREIGN KEY (AgendaId) REFERENCES Agendas(Id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AgendaVisibilities')
BEGIN
    CREATE TABLE AgendaVisibilities (
        Id INT PRIMARY KEY IDENTITY(1,1),
        AgendaId INT NOT NULL,
        UserId INT NOT NULL,
        FOREIGN KEY (AgendaId) REFERENCES Agendas(Id) ON DELETE CASCADE
    );
END
GO

-- =============================================
-- BEKLEYENLER TABLOSU
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Pendings')
BEGIN
    CREATE TABLE Pendings (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Title NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        Type NVARCHAR(50) DEFAULT 'diger',
        Status NVARCHAR(50) DEFAULT 'bekliyor',
        Priority NVARCHAR(50) DEFAULT 'orta',
        RequesterName NVARCHAR(100) NULL,
        RequesterPhone NVARCHAR(20) NULL,
        Location NVARCHAR(255) NULL,
        ScheduleType NVARCHAR(50) NULL,
        ScheduledDate DATETIME NULL,
        CreatedBy INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PendingAssignments')
BEGIN
    CREATE TABLE PendingAssignments (
        Id INT PRIMARY KEY IDENTITY(1,1),
        PendingId INT NOT NULL,
        UserId INT NOT NULL,
        FOREIGN KEY (PendingId) REFERENCES Pendings(Id) ON DELETE CASCADE
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PendingVisibilities')
BEGIN
    CREATE TABLE PendingVisibilities (
        Id INT PRIMARY KEY IDENTITY(1,1),
        PendingId INT NOT NULL,
        UserId INT NOT NULL,
        FOREIGN KEY (PendingId) REFERENCES Pendings(Id) ON DELETE CASCADE
    );
END
GO

-- =============================================
-- PROGRAM TABLOSU
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Schedules')
BEGIN
    CREATE TABLE Schedules (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Title NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX) NULL,
        Type NVARCHAR(50) DEFAULT 'diger',
        Date DATETIME NOT NULL,
        StartTime NVARCHAR(10) NULL,
        EndTime NVARCHAR(10) NULL,
        Location NVARCHAR(255) NULL,
        CreatedBy INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- CENAZELER TABLOSU
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cenazes')
BEGIN
    CREATE TABLE Cenazes (
        Id INT PRIMARY KEY IDENTITY(1,1),
        VefatEden NVARCHAR(255) NOT NULL,
        Tarih DATETIME NULL,
        Saat NVARCHAR(10) NULL,
        NamazVakti NVARCHAR(50) NULL,
        Mahalle NVARCHAR(100) NULL,
        Notlar NVARCHAR(MAX) NULL,
        YakinAdi NVARCHAR(100) NULL,
        YakinTelefon NVARCHAR(20) NULL,
        Yakinlik NVARCHAR(50) NULL,
        BaskanAradiMi BIT DEFAULT 0,
        GorevliId INT NULL,
        GorevliAdi NVARCHAR(100) NULL,
        Tamamlandi BIT DEFAULT 0,
        CreatedBy INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CenazeVisibilities')
BEGIN
    CREATE TABLE CenazeVisibilities (
        Id INT PRIMARY KEY IDENTITY(1,1),
        CenazeId INT NOT NULL,
        UserId INT NOT NULL,
        FOREIGN KEY (CenazeId) REFERENCES Cenazes(Id) ON DELETE CASCADE
    );
END
GO

-- =============================================
-- BİLDİRİMLER TABLOSU
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE Notifications (
        Id INT PRIMARY KEY IDENTITY(1,1),
        UserId INT NOT NULL,
        Title NVARCHAR(255) NOT NULL,
        Message NVARCHAR(MAX) NULL,
        Type NVARCHAR(50) DEFAULT 'info',
        IsRead BIT DEFAULT 0,
        Link NVARCHAR(255) NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- =============================================
-- VARSAYILAN KULLANICILAR
-- =============================================
-- Şifre: 11223344 (BCrypt hash)
-- Bu hash'i .NET uygulaması oluşturacak, burada örnek olarak ekliyoruz

IF NOT EXISTS (SELECT * FROM Users WHERE Id = 1)
BEGIN
    INSERT INTO Users (Name, Role, PasswordHash) VALUES 
    ('Oktay Yılmaz', 'baskan', '$2a$11$rBNdB0v0G5K5K5K5K5K5KeABCDEFGHIJKLMNOPQRSTUVWXYZ123456'),
    ('Merve Ekmekci', 'ozel_kalem', '$2a$11$rBNdB0v0G5K5K5K5K5K5KeABCDEFGHIJKLMNOPQRSTUVWXYZ123456'),
    ('Ahmet Uslu', 'baskan_yrd', '$2a$11$rBNdB0v0G5K5K5K5K5K5KeABCDEFGHIJKLMNOPQRSTUVWXYZ123456'),
    ('Gökhan Yıldız', 'baskan_yrd', '$2a$11$rBNdB0v0G5K5K5K5K5K5KeABCDEFGHIJKLMNOPQRSTUVWXYZ123456'),
    ('Kamil Kanbur', 'baskan_yrd', '$2a$11$rBNdB0v0G5K5K5K5K5K5KeABCDEFGHIJKLMNOPQRSTUVWXYZ123456');
END
GO

PRINT 'Veritabanı başarıyla oluşturuldu!';
GO
