const projects = [
  {
    title: "Yıldırım Meydanı Düzenlemesi",
    description: "Meydan çevresi peyzaj ve aydınlatma çalışması. Oturma alanları, yeşil alanlar ve yürüyüş yolları yenilenecek.",
    status: "devam_ediyor",
    progress: 45,
    priority: "yuksek",
    createdBy: 1,
    assignedTo: [],
    visibleTo: []
  },
  {
    title: "Okul Bahçesi Yenileme",
    description: "İlkokul bahçesine oyun alanı ve spor sahası yapımı. Çocuklar için güvenli oyun parkı kurulacak.",
    status: "beklemede",
    progress: 10,
    priority: "orta",
    createdBy: 1,
    assignedTo: [],
    visibleTo: []
  },
  {
    title: "Cadde Asfalt Yenileme",
    description: "Ana cadde asfalt döküm ve kaldırım düzenleme projesi. 2.5 km yol yenilenecek.",
    status: "tamamlandi",
    progress: 100,
    priority: "yuksek",
    createdBy: 1,
    assignedTo: [],
    visibleTo: []
  }
];

async function addProjects() {
  for (const project of projects) {
    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✓ Eklendi: ${project.title}`);
      } else {
        const error = await response.text();
        console.log(`✗ Hata (${response.status}): ${project.title}`);
        console.log(error);
      }
    } catch (error) {
      console.error(`✗ Hata: ${project.title}`, error.message);
    }
  }
  
  // Sonucu kontrol et
  console.log('\n--- Mevcut Projeler ---');
  const res = await fetch('http://localhost:5000/api/projects');
  const all = await res.json();
  all.forEach(p => console.log(`- ${p.id}: ${p.title || '(boş)'} [${p.status}] %${p.progress}`));
}

addProjects();
