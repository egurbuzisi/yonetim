// Örnek projeler oluştur
const API_URL = 'http://localhost:5000/api/projects';

async function createSampleProjects() {
  console.log('🚀 Örnek projeler oluşturuluyor...\n');

  // Önce mevcut projeleri sil
  try {
    const res = await fetch(API_URL);
    const existing = await res.json();
    console.log(`📋 Mevcut proje sayısı: ${existing.length}`);
    
    for (const project of existing) {
      await fetch(`${API_URL}/${project.id}`, { method: 'DELETE' });
      console.log(`🗑️ Silindi: ID ${project.id}`);
    }
  } catch (err) {
    console.log('⚠️ Silme hatası:', err.message);
  }

  // Yeni projeler
  const projects = [
    {
      title: 'Merkez Cami Çevre Düzenlemesi',
      description: 'Merkez Cami etrafındaki peyzaj düzenleme ve aydınlatma çalışması',
      status: 'devam_ediyor',
      priority: 'yuksek',
      progress: 45,
      startDate: '2025-11-01',
      endDate: '2026-02-15',
      mahalle: 'Esenevler',
      createdBy: '1',
      visibleTo: ['1', '2', '3', '4', '5', '6', '7'],
      tags: ['kentsel_donusum', 'park_bahce']
    },
    {
      title: 'Yıldırım Spor Kompleksi',
      description: 'Yeni spor tesisi inşaatı - futbol sahası, basketbol sahası ve fitness alanı',
      status: 'planlandi',
      priority: 'orta',
      progress: 10,
      startDate: '2026-01-15',
      endDate: '2026-08-30',
      mahalle: 'Millet',
      createdBy: '1',
      visibleTo: ['1', '2', '3', '4', '5', '6', '7'],
      tags: ['spor', 'sosyal_tesis']
    },
    {
      title: 'GES Projesi - Belediye Binası',
      description: 'Belediye binası çatısına güneş enerji paneli kurulumu',
      status: 'dusunuluyor',
      priority: 'orta',
      progress: 0,
      startDate: null,
      endDate: null,
      mahalle: 'Esenevler',
      createdBy: '1',
      visibleTo: ['1', '2', '3'],
      tags: ['ges_projesi', 'altyapi']
    },
    {
      title: 'Kapalı Pazar Alanı Renovasyonu',
      description: 'Mevcut kapalı pazar alanının modernizasyonu ve genişletilmesi',
      status: 'devam_ediyor',
      priority: 'yuksek',
      progress: 72,
      startDate: '2025-08-01',
      endDate: '2026-01-20', // Bitiş yaklaşıyor!
      mahalle: 'Arabayatağı',
      createdBy: '2',
      visibleTo: ['1', '2', '3', '4', '5'],
      tags: ['kapali_pazar', 'tadilat']
    },
    {
      title: 'Sokak Sağlıklaştırma Projesi',
      description: 'Tarihi sokakların yenilenmesi ve altyapı iyileştirme',
      status: 'devam_ediyor',
      priority: 'orta',
      progress: 30,
      startDate: '2025-06-01',
      endDate: '2026-06-01',
      mahalle: 'Selçukbey',
      createdBy: '1',
      visibleTo: ['1', '2', '3', '4', '5', '6', '7'],
      tags: ['kentsel_donusum', 'altyapi']
    }
  ];

  // Projeleri ekle
  for (const project of projects) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });

      if (response.ok) {
        const created = await response.json();
        console.log(`✅ Oluşturuldu: ${project.title} (ID: ${created.id})`);
      } else {
        const error = await response.text();
        console.log(`❌ Hata (${project.title}): ${error}`);
      }
    } catch (err) {
      console.log(`❌ Hata (${project.title}): ${err.message}`);
    }
  }

  console.log('\n✨ Tamamlandı! Sayfayı yenileyin (Ctrl+Shift+R)');
}

createSampleProjects();
