async function checkAPI() {
  try {
    console.log('API kontrol ediliyor...\n');
    
    // Projeleri çek
    const projectsRes = await fetch('http://localhost:5000/api/projects');
    const projects = await projectsRes.json();
    console.log('Projeler:', projects.length, 'adet');
    console.log(JSON.stringify(projects, null, 2));
    
    // Kullanıcıları çek
    const usersRes = await fetch('http://localhost:5000/api/users');
    const users = await usersRes.json();
    console.log('\nKullanıcılar:', users.length, 'adet');
    console.log(JSON.stringify(users, null, 2));
    
  } catch (error) {
    console.error('API Hatası:', error.message);
  }
}

checkAPI();
