const http = require('http');

const projects = [
  {
    title: "Yıldırım Meydanı Düzenlemesi",
    description: "Meydan çevresi peyzaj ve aydınlatma çalışması. Oturma alanları, yeşil alanlar ve yürüyüş yolları yenilenecek.",
    status: "devam_ediyor",
    priority: "yuksek",
    progress: 45,
    createdBy: "1",
    visibleTo: ["2", "3", "4"]
  },
  {
    title: "Okul Yolu Güvenlik Projesi",
    description: "İlkokul ve ortaokul çevrelerinde trafik düzenlemesi, yaya geçitleri ve güvenlik kameraları yerleştirilecek.",
    status: "planlandi",
    priority: "yuksek",
    progress: 10,
    createdBy: "1",
    visibleTo: ["2", "3"]
  },
  {
    title: "Sosyal Tesis Tadilat",
    description: "Merkez mahalle sosyal tesisinin iç mekan yenilemesi. Tuvalet, mutfak ve toplantı salonu tadilatı yapılacak.",
    status: "beklemede",
    priority: "orta",
    progress: 0,
    createdBy: "1",
    visibleTo: ["3", "5", "6"]
  }
];

async function createProject(project) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(project);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log(`✅ Proje oluşturuldu: ${project.title}`);
          resolve(JSON.parse(body));
        } else {
          console.log(`❌ Hata (${res.statusCode}): ${body}`);
          reject(new Error(body));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Örnek projeler oluşturuluyor...\n');
  
  for (const project of projects) {
    try {
      await createProject(project);
    } catch (err) {
      console.error('Hata:', err.message);
    }
  }
  
  console.log('\n✅ Tamamlandı!');
}

main();
