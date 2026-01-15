using IsYonetim.Api.Models;
using BCrypt.Net;

namespace IsYonetim.Api.Data;

public static class DbSeeder
{
    public static void SeedData(AppDbContext context)
    {
        if (context.Users.Any()) return;

        var passwordHash = BCrypt.Net.BCrypt.HashPassword("11223344");

        var users = new List<User>
        {
            // Başkan
            new() { Id = 1, Name = "Oktay YILMAZ", Email = "oktay.yilmaz@yildirim.bel.tr", Phone = "", Role = "baskan", Department = "Başkanlık", PasswordHash = passwordHash },
            
            // Özel Kalem
            new() { Id = 2, Name = "Merve EKMEKCİ", Email = "merve.ekmekci@yildirim.bel.tr", Phone = "0555 364 57 63", Role = "ozel_kalem", Department = "Özel Kalem Müdürlüğü", PasswordHash = passwordHash },
            
            // Başkan Yardımcıları
            new() { Id = 3, Name = "Ahmet USLU", Email = "ahmet.uslu@yildirim.bel.tr", Phone = "0535 618 14 10", Role = "baskan_yardimcisi", Department = "Belediye Başkan Yardımcılığı", PasswordHash = passwordHash },
            new() { Id = 4, Name = "Gökhan YILDIZ", Email = "gokhan.yildiz@yildirim.bel.tr", Phone = "0532 498 70 72", Role = "baskan_yardimcisi", Department = "Belediye Başkan Yardımcılığı", PasswordHash = passwordHash },
            new() { Id = 5, Name = "Kamil KANBUR", Email = "kamil.kanbur@yildirim.bel.tr", Phone = "0535 558 56 58", Role = "baskan_yardimcisi", Department = "Belediye Başkan Yardımcılığı", PasswordHash = passwordHash },
            new() { Id = 6, Name = "Mehmet Ali YAZICI", Email = "mehmetali.yazici@yildirim.bel.tr", Phone = "0535 471 21 08", Role = "baskan_yardimcisi", Department = "Belediye Başkan Yardımcılığı", PasswordHash = passwordHash },
            new() { Id = 7, Name = "Ayşe ERTAN", Email = "ayse.ertan@yildirim.bel.tr", Phone = "0532 202 67 75", Role = "baskan_yardimcisi", Department = "Belediye Başkan Yardımcılığı", PasswordHash = passwordHash },
            
            // Müdürler
            new() { Id = 10, Name = "Özmen BİLGİN", Email = "ozmen.bilgin@yildirim.bel.tr", Phone = "0532 582 55 57", Role = "mudur", Department = "Yazı İşleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 11, Name = "Abdülkadir ALBYARAK", Email = "abdulkadir.albyarak@yildirim.bel.tr", Phone = "0544 774 70 44", Role = "mudur", Department = "Afet İşleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 12, Name = "Engin ÖKSÜZ", Email = "engin.oksuz@yildirim.bel.tr", Phone = "0506 734 48 37", Role = "mudur", Department = "Bilgi İşlem Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 13, Name = "İbrahim TÜRKMEN", Email = "ibrahim.turkmen@yildirim.bel.tr", Phone = "0536 250 34 06", Role = "mudur", Department = "Zabıta Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 14, Name = "Osman Hüray YILDIZ", Email = "osman.yildiz@yildirim.bel.tr", Phone = "0533 240 89 09", Role = "mudur", Department = "Destek Hizmetleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 15, Name = "Hüseyin BURAN", Email = "huseyin.buran@yildirim.bel.tr", Phone = "0533 938 71 53", Role = "mudur", Department = "Kültür Tanıtma Birlik Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 16, Name = "Erim GÜNEŞ", Email = "erim.gunes@yildirim.bel.tr", Phone = "", Role = "mudur", Department = "Kültür ve Sosyal İşler Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 17, Name = "Coşkun KONCA", Email = "coskun.konca@yildirim.bel.tr", Phone = "", Role = "mudur", Department = "Gençlik ve Spor Hizmetleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 18, Name = "Dilek GÜMÜŞ", Email = "dilek.gumus@yildirim.bel.tr", Phone = "0532 688 03 43", Role = "mudur", Department = "İmar ve Şehircilik Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 19, Name = "Sabahattin ÜNER", Email = "sabahattin.uner@yildirim.bel.tr", Phone = "0533 653 22 81", Role = "mudur", Department = "Plan ve Proje Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 20, Name = "Hilmi YETİMOĞLU", Email = "hilmi.yetimoglu@yildirim.bel.tr", Phone = "", Role = "mudur", Department = "Fen İşleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 21, Name = "Ayça KARAHAN", Email = "ayca.karahan@yildirim.bel.tr", Phone = "0532 480 89 59", Role = "mudur", Department = "Kentsel Tasarım Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 22, Name = "Emrah NASIR", Email = "emrah.nasir@yildirim.bel.tr", Phone = "", Role = "mudur", Department = "Mali Hizmetler Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 23, Name = "Muammer ÖZBEY", Email = "muammer.ozbey@yildirim.bel.tr", Phone = "0532 316 16 11", Role = "mudur", Department = "Muhtarlık İşleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 24, Name = "Ufuk RADANLI", Email = "ufuk.radanli@yildirim.bel.tr", Phone = "0551 410 52 72", Role = "mudur", Department = "Strateji Geliştirme Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 25, Name = "Murat ÖZ", Email = "murat.oz@yildirim.bel.tr", Phone = "0532 620 85 17", Role = "mudur", Department = "Hukuk İşleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 26, Name = "M.Akif ERGÜVENOĞLU", Email = "akif.erguvenoglu@yildirim.bel.tr", Phone = "0506 051 63 69", Role = "mudur", Department = "İklim Değişikliği ve Sıfır Atık Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 27, Name = "Ali ENGİN", Email = "ali.engin@yildirim.bel.tr", Phone = "0539 416 75 96", Role = "mudur", Department = "Temizlik İşleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 28, Name = "Özgür ŞENOCAK", Email = "ozgur.senocak@yildirim.bel.tr", Phone = "", Role = "mudur", Department = "Ulaşım Hizmetleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 29, Name = "Özkan SÖZERİ", Email = "ozkan.sozeri@yildirim.bel.tr", Phone = "0532 579 68 46", Role = "mudur", Department = "Yapı Kontrol Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 30, Name = "Abdurrahman KARYEL", Email = "abdurrahman.karyel@yildirim.bel.tr", Phone = "0530 774 05 31", Role = "mudur", Department = "Park ve Bahçeler Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 31, Name = "Feyyat ÖZDEMİR", Email = "feyyat.ozdemir@yildirim.bel.tr", Phone = "0554 374 43 27", Role = "mudur", Department = "Halkla İlişkiler Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 32, Name = "Ömer YAŞAR", Email = "omer.yasar@yildirim.bel.tr", Phone = "0553 006 33 22", Role = "mudur", Department = "Sosyal Destek Hizmetleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 33, Name = "Ebru YÜKSEL", Email = "ebru.yuksel@yildirim.bel.tr", Phone = "0541 459 96 76", Role = "mudur", Department = "Kadın ve Aile Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 34, Name = "Kahraman MENTEŞE", Email = "kahraman.mentese@yildirim.bel.tr", Phone = "0505 394 72 40", Role = "mudur", Department = "Sağlık İşleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 35, Name = "Nedret ÇEKMECELİGİL", Email = "nedret.cekmecelgil@yildirim.bel.tr", Phone = "0535 691 90 19", Role = "mudur", Department = "Veteriner İşleri Müdürlüğü", PasswordHash = passwordHash },
            new() { Id = 36, Name = "M.Hilmi DOĞANAY", Email = "hilmi.doganay@yildirim.bel.tr", Phone = "0533 469 96 24", Role = "mudur", Department = "İnsan Kaynakları ve Eğitim Müdürlüğü", PasswordHash = passwordHash },
        };

        context.Users.AddRange(users);
        context.SaveChanges();

        Console.WriteLine("✅ Varsayılan kullanıcılar eklendi");
    }
}
