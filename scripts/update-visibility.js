async function updateVisibility() {
  // Mevcut projeleri al
  const res = await fetch('http://localhost:5000/api/projects');
  const projects = await res.json();
  
  console.log('Mevcut projeler:', projects.length);
  
  // Her projeyi güncelle - tüm kullanıcılara görünür yap
  for (const project of projects) {
    try {
      const updateData = {
        ...project,
        visibleTo: ["1", "2", "3", "4", "5", "6", "7", "10", "11", "12"]
      };
      
      const response = await fetch(`http://localhost:5000/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        console.log(`✓ Güncellendi: ${project.title || project.id}`);
      } else {
        console.log(`✗ Hata: ${project.id}`, await response.text());
      }
    } catch (error) {
      console.error(`✗ Hata: ${project.id}`, error.message);
    }
  }
  
  console.log('\nTamamlandı! Sayfayı yenileyin.');
}

updateVisibility();
