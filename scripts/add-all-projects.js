const projects = [
  { title: "Bağlaraltı Kapalı Pazar Alanı", tag: "Kapalı Pazar Alanı" },
  { title: "Duaçınarı Kültür Merkezi", tag: "Kültür Merkezi" },
  { title: "Yavuzselim Pazar Alanı", tag: "Kapalı Pazar Alanı" },
  { title: "Müsellim Köşkü", tag: "Restorasyon" },
  { title: "Davutkadı Kentsel Dönüşüm", tag: "Kentsel Dönüşüm" },
  { title: "Arabayatağı Kentsel Dönüşüm", tag: "Kentsel Dönüşüm" },
  { title: "İsabey Cephe Sağlıklaştırma", tag: "Cephe Sağlıklaştırma" },
  { title: "Aşık Sümmani Kültür Merkezi", tag: "Kültür Merkezi" },
  { title: "Fevziye Parkı", tag: "Koru" },
  { title: "Osman Fevzi Efendi Yazlık Köşkü Rekonstrüksiyon Projesi", tag: "Restorasyon" },
  { title: "Selimzade S.M.Ö", tag: "Restorasyon" },
  { title: "Hayvan Barınağı Tadilat Projesi", tag: "Hayvan Barınağı" },
  { title: "Emirsultan Aile Sağlığı Merkezi", tag: "Aile Sağlığı Merkezi" },
  { title: "Murat Emri Evi", tag: "Restorasyon" },
  { title: "Hünkar Korusu", tag: "Koru" },
  { title: "Cumalıkızık Çarşı", tag: "Çarşı" },
  { title: "Cazibe Merkezi", tag: "Çarşı" },
  { title: "Namazgah Parkı", tag: "Park" },
  { title: "Çınarönü Teknopark", tag: "Teknopark" },
  { title: "Ermeni Kilisesi", tag: "Restorasyon" },
  { title: "Piremir Spor Tesisi", tag: "Spor Tesisi" },
  { title: "Piremir Halı Saha", tag: "Spor Tesisi" },
  { title: "Demetevler Pazar Alanı", tag: "Kapalı Pazar Alanı" },
  { title: "Hacıvat Pazar Alanı", tag: "Kapalı Pazar Alanı" },
  { title: "Esenevler Pazar Alanı", tag: "Kapalı Pazar Alanı" },
  { title: "Kaplıkaya Kapalı Tenis Kortu Projesi", tag: "Tenis Kort" },
  { title: "Yıldırım Ziyaretçi Merkezi", tag: "Ziyaretçi Merkezi" },
  { title: "Yıldırım Külliyesi", tag: "Ziyaretçi Merkezi" },
  { title: "Tarihi Kent Merkezi Yarışması (Hocataşkın, Yeşil, Emirsultan)", tag: "Yarışma" },
  { title: "Zeyniler Seyir Terası", tag: "Seyir Terası" },
  { title: "Kurtoğlu S.M.Ö (Papazın Evi)", tag: "Restorasyon" },
  { title: "Emirsultan Kuran Kursu", tag: "Kuran Kursu" },
  { title: "Bursaspor Spor Lisesi", tag: "Okul" },
  { title: "Sporcu Sağlığı Merkezi", tag: "Sporcu Sağlığı Merkezi" },
  { title: "Spor Festivali", tag: "Festival" },
  { title: "Halı Sahaların Okula Tahsisi", tag: "Halı Saha" },
  { title: "Gençlik Merkezlerinde Söyleşi", tag: "Söyleşi" },
  { title: "Bina Güçlendirilmesi", tag: "Bina Güçlendirmesi" },
  { title: "Şantiye İdari Binası", tag: "Şantiye Binası" },
  { title: "İlçe Afet İşleri Ve Kontrol Merkezi", tag: "AFAD Binası" },
  { title: "Mimar Sinan Lojman Dönüşümü", tag: "Kentsel Dönüşüm" },
  { title: "Bereket Sofrası", tag: "Bereket Sofrası" },
  { title: "Sosyal Tesisler", tag: "Sosyal Tesisler" },
  { title: "Halı Sahalar", tag: "Spor Tesisi" },
  { title: "Halı Saha Yenilemeleri", tag: "Spor Tesisi Yenileme" },
  { title: "Değirmenönü Mesire Alanı", tag: "Mesire Alanı" },
  { title: "Küreklidere Orman Parkı", tag: "Orman Parkı" },
  { title: "Deliçay Kent Parkı", tag: "Kent Parkı" },
  { title: "Değirmenlikızık Kent Parkı", tag: "Kent Parkı" },
  { title: "GES Projesi", tag: "GES Projesi" },
  { title: "İnternet Erişim Noktaları", tag: "İnternet Erişim Noktaları" },
  { title: "Sıfır Atık Mobil Aracı", tag: "Sıfır Atık Proje" },
  { title: "Yıldırım Kart", tag: "Yıldırım Kart" },
  { title: "Up Kafe", tag: "Sosyal Tesisler" },
  { title: "E-Spor Merkezi", tag: "E-Spor" },
  { title: "Stüdyo Yıldırım", tag: "Sosyal Tesisler" },
  { title: "Yıldırım Tiyatro Otobüsü", tag: "Sosyal Tesisler" },
  { title: "Dil Kafe", tag: "Sosyal Tesisler" },
  { title: "Matematik Evi", tag: "Sosyal Tesisler" },
  { title: "Cumalıkızık Manej", tag: "Manej Alanı" },
  { title: "Çocuk Köyü - Cumalıkızık 2. Etap", tag: "Çocuk Köyü" },
  { title: "Kadıyayla Kamp Merkezi", tag: "Kamp Merkezi" },
  { title: "Enerji Verimliliği Ofisi", tag: "Enerji Birim" }
];

async function addProjects() {
  console.log(`Toplam ${projects.length} proje eklenecek...\n`);
  
  let success = 0;
  let failed = 0;
  
  for (const p of projects) {
    const projectData = {
      title: p.title,
      description: p.tag,
      status: "dusunuluyor",
      priority: "orta",
      progress: 0,
      startDate: "2024-04-01T00:00:00",
      createdBy: 1,
      visibleTo: []
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(projectData)
      });
      
      if (response.ok) {
        console.log(`✓ ${p.title} [${p.tag}]`);
        success++;
      } else {
        console.log(`✗ ${p.title} - Hata: ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ${p.title} - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Başarılı: ${success} | Başarısız: ${failed}`);
  console.log(`========================================`);
  
  // Kontrol
  console.log(`\nİlk 5 proje kontrol:`);
  const res = await fetch('http://localhost:5000/api/projects');
  const all = await res.json();
  all.slice(0, 5).forEach(p => console.log(`- ${p.title} | ${p.description}`));
}

addProjects();
