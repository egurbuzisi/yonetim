async function checkMessagesAPI() {
  console.log('Mesaj API kontrolü...\n');
  
  // Mesaj endpoint'i var mı?
  const endpoints = [
    '/api/messages',
    '/api/projectmessages', 
    '/api/project-messages',
    '/api/projects/1/messages'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`);
      console.log(`${endpoint}: ${res.status} ${res.statusText}`);
      if (res.ok) {
        const data = await res.json();
        console.log('  Veri:', JSON.stringify(data).substring(0, 100));
      }
    } catch (e) {
      console.log(`${endpoint}: Hata - ${e.message}`);
    }
  }
}

checkMessagesAPI();
