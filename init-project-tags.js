const fs = require('fs');
const path = require('path');

// Renk paleti
const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-orange-100 text-orange-700',
  'bg-green-100 text-green-700',
  'bg-emerald-100 text-emerald-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-violet-100 text-violet-700',
  'bg-lime-100 text-lime-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-sky-100 text-sky-700',
];

async function initTags() {
  try {
    // Projelerden etiketleri al
    const response = await fetch('http://localhost:5000/api/projects');
    const projects = await response.json();
    
    // Benzersiz etiketleri çıkar
    const uniqueTags = [...new Set(projects.map(p => p.description).filter(Boolean))].sort();
    
    console.log(`${uniqueTags.length} benzersiz etiket bulundu\n`);
    
    // Etiketleri oluştur
    const tags = uniqueTags.map((label, index) => {
      const id = label.toLowerCase()
        .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
        .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ı/g, 'i')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      return {
        id,
        label,
        color: COLORS[index % COLORS.length]
      };
    });
    
    // JSON dosyasına yaz
    const filePath = path.join(__dirname, 'messages-api', 'data', 'project-tags.json');
    fs.writeFileSync(filePath, JSON.stringify(tags, null, 2));
    
    console.log(`✓ ${tags.length} etiket kaydedildi: ${filePath}\n`);
    
    // İlk 10'u göster
    console.log('İlk 10 etiket:');
    tags.slice(0, 10).forEach(t => console.log(`- ${t.label} (${t.id})`));
    
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

initTags();
