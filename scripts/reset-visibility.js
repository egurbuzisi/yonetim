async function resetVisibility() {
  const res = await fetch('http://localhost:5000/api/projects');
  const projects = await res.json();
  
  console.log('Projeler sıfırlanıyor...\n');
  
  for (const project of projects) {
    try {
      const updateData = {
        ...project,
        visibleTo: [] // Boş - sadece başkan, özel kalem ve oluşturan görecek
      };
      
      const response = await fetch(`http://localhost:5000/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        console.log(`✓ ${project.title || 'Proje ' + project.id} - visibleTo: [] (boş)`);
      }
    } catch (error) {
      console.error(`✗ Hata: ${project.id}`);
    }
  }
  
  console.log('\n---');
  console.log('Başkan (Oktay Yılmaz) → Tüm projeleri görür');
  console.log('Özel Kalem (Merve Ekmekci) → Tüm projeleri görür');
  console.log('Diğerleri → Sadece kendi oluşturdukları veya paylaşılanları görür');
}

resetVisibility();
