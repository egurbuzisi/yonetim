const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = 5001;

// HTTP server oluştur
const server = http.createServer(app);

// WebSocket server oluştur
const wss = new WebSocket.Server({ server });

// Bağlı kullanıcıları takip et (userId -> ws)
const connectedClients = new Map();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');
const AGENDA_MESSAGES_FILE = path.join(DATA_DIR, 'agenda-messages.json');
const TASK_TYPES_FILE = path.join(DATA_DIR, 'task-types.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const STAFF_FILE = path.join(DATA_DIR, 'staff.json');
const PROJECT_TAGS_FILE = path.join(DATA_DIR, 'project-tags.json');

// Varsayılan görevliler (müdürler, başkan yardımcıları, meclis üyeleri)
const DEFAULT_STAFF = [
  // Başkan Yardımcıları
  { id: '1', name: 'Ahmet Uslu', role: 'baskan_yrd', title: 'Başkan Yardımcısı', phone: '', active: true },
  { id: '2', name: 'Gökhan Yıldız', role: 'baskan_yrd', title: 'Başkan Yardımcısı', phone: '', active: true },
  { id: '3', name: 'Kamil Kanbur', role: 'baskan_yrd', title: 'Başkan Yardımcısı', phone: '', active: true },
  // Müdürler
  { id: '4', name: 'Yazı İşleri Müdürü', role: 'mudur', title: 'Yazı İşleri Müdürü', phone: '', active: true },
  { id: '5', name: 'Fen İşleri Müdürü', role: 'mudur', title: 'Fen İşleri Müdürü', phone: '', active: true },
  { id: '6', name: 'Mali Hizmetler Müdürü', role: 'mudur', title: 'Mali Hizmetler Müdürü', phone: '', active: true },
  { id: '7', name: 'İmar Müdürü', role: 'mudur', title: 'İmar Müdürü', phone: '', active: true },
  { id: '8', name: 'Temizlik İşleri Müdürü', role: 'mudur', title: 'Temizlik İşleri Müdürü', phone: '', active: true },
  { id: '9', name: 'Park Bahçe Müdürü', role: 'mudur', title: 'Park Bahçe Müdürü', phone: '', active: true },
  { id: '10', name: 'Zabıta Müdürü', role: 'mudur', title: 'Zabıta Müdürü', phone: '', active: true },
];

// Varsayılan kayıt türleri
const DEFAULT_TASK_TYPES = [
  { id: 'talep', label: 'Talep', icon: 'MessageSquare', color: 'blue' },
  { id: 'dugun', label: 'Düğün Daveti', icon: 'Heart', color: 'pink' },
  { id: 'randevu', label: 'Randevu', icon: 'Calendar', color: 'green' },
  { id: 'gorev', label: 'Görev', icon: 'Briefcase', color: 'purple' },
  { id: 'diger', label: 'Diğer', icon: 'FileText', color: 'gray' },
];

// Varsayılan proje etiketleri
const DEFAULT_PROJECT_TAGS = [
  { id: 'kapali_pazar_alani', label: 'Kapalı Pazar Alanı', color: 'bg-blue-100 text-blue-700' },
  { id: 'kultur_merkezi', label: 'Kültür Merkezi', color: 'bg-purple-100 text-purple-700' },
  { id: 'restorasyon', label: 'Restorasyon', color: 'bg-amber-100 text-amber-700' },
  { id: 'kentsel_donusum', label: 'Kentsel Dönüşüm', color: 'bg-orange-100 text-orange-700' },
  { id: 'spor_tesisi', label: 'Spor Tesisi', color: 'bg-green-100 text-green-700' },
  { id: 'park', label: 'Park', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'sosyal_tesisler', label: 'Sosyal Tesisler', color: 'bg-pink-100 text-pink-700' },
  { id: 'egitim', label: 'Eğitim', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'altyapi', label: 'Altyapı', color: 'bg-gray-100 text-gray-700' },
  { id: 'diger', label: 'Diğer', color: 'bg-slate-100 text-slate-700' },
];

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(MESSAGES_FILE)) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
}
if (!fs.existsSync(NOTIFICATIONS_FILE)) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(AGENDA_MESSAGES_FILE)) {
  fs.writeFileSync(AGENDA_MESSAGES_FILE, JSON.stringify([]));
}
if (!fs.existsSync(TASK_TYPES_FILE)) {
  fs.writeFileSync(TASK_TYPES_FILE, JSON.stringify(DEFAULT_TASK_TYPES));
}
if (!fs.existsSync(CONTACTS_FILE)) {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(STAFF_FILE)) {
  fs.writeFileSync(STAFF_FILE, JSON.stringify(DEFAULT_STAFF));
}
if (!fs.existsSync(PROJECT_TAGS_FILE)) {
  fs.writeFileSync(PROJECT_TAGS_FILE, JSON.stringify(DEFAULT_PROJECT_TAGS));
}

// Helper functions
const readMessages = () => {
  try {
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeMessages = (messages) => {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
};

const readNotifications = () => {
  try {
    return JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeNotifications = (notifications) => {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
};

const readAgendaMessages = () => {
  try {
    return JSON.parse(fs.readFileSync(AGENDA_MESSAGES_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeAgendaMessages = (messages) => {
  fs.writeFileSync(AGENDA_MESSAGES_FILE, JSON.stringify(messages, null, 2));
};

const readTaskTypes = () => {
  try {
    return JSON.parse(fs.readFileSync(TASK_TYPES_FILE, 'utf8'));
  } catch {
    return DEFAULT_TASK_TYPES;
  }
};

const writeTaskTypes = (types) => {
  fs.writeFileSync(TASK_TYPES_FILE, JSON.stringify(types, null, 2));
};

const readContacts = () => {
  try {
    return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8'));
  } catch {
    return [];
  }
};

const writeContacts = (contacts) => {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contacts, null, 2));
};

const readStaff = () => {
  try {
    return JSON.parse(fs.readFileSync(STAFF_FILE, 'utf8'));
  } catch {
    return DEFAULT_STAFF;
  }
};

const writeStaff = (staff) => {
  fs.writeFileSync(STAFF_FILE, JSON.stringify(staff, null, 2));
};

const readProjectTags = () => {
  try {
    return JSON.parse(fs.readFileSync(PROJECT_TAGS_FILE, 'utf8'));
  } catch {
    return DEFAULT_PROJECT_TAGS;
  }
};

const writeProjectTags = (tags) => {
  fs.writeFileSync(PROJECT_TAGS_FILE, JSON.stringify(tags, null, 2));
};

// WebSocket: Belirli kullanıcılara mesaj gönder
const broadcastToUsers = (userIds, data) => {
  userIds.forEach(userId => {
    const clients = connectedClients.get(userId);
    if (clients) {
      clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      });
    }
  });
};

// WebSocket: Belirli bir projeyi izleyenlere mesaj gönder
const broadcastToProject = (projectId, data, excludeUserId = null) => {
  connectedClients.forEach((clients, userId) => {
    if (userId !== excludeUserId) {
      clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN && ws.watchingProjects?.includes(projectId)) {
          ws.send(JSON.stringify(data));
        }
      });
    }
  });
};

// WebSocket: Tüm bağlı istemcilere yayınla
const broadcastAll = (data, excludeUserId = null) => {
  connectedClients.forEach((clients, userId) => {
    if (userId !== excludeUserId) {
      clients.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      });
    }
  });
};

// WebSocket bağlantı yönetimi
wss.on('connection', (ws) => {
  console.log('🔌 Yeni WebSocket bağlantısı');
  
  ws.watchingProjects = [];
  ws.watchingAgendas = [];
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Kullanıcı kimliği ile kayıt ol
      if (data.type === 'register') {
        const userId = data.userId;
        if (!connectedClients.has(userId)) {
          connectedClients.set(userId, new Set());
        }
        connectedClients.get(userId).add(ws);
        ws.userId = userId;
        console.log(`👤 Kullanıcı ${userId} bağlandı`);
      }
      
      // Proje izlemeye başla
      if (data.type === 'watch_project') {
        if (!ws.watchingProjects.includes(data.projectId)) {
          ws.watchingProjects.push(data.projectId);
          console.log(`👀 Kullanıcı ${ws.userId} proje ${data.projectId} izliyor`);
        }
      }
      
      // Proje izlemeyi bırak
      if (data.type === 'unwatch_project') {
        ws.watchingProjects = ws.watchingProjects.filter(p => p !== data.projectId);
      }
      
      // Gündem izlemeye başla
      if (data.type === 'watch_agenda') {
        if (!ws.watchingAgendas.includes(data.agendaId)) {
          ws.watchingAgendas.push(data.agendaId);
          console.log(`👀 Kullanıcı ${ws.userId} gündem ${data.agendaId} izliyor`);
        }
      }
      
      // Gündem izlemeyi bırak
      if (data.type === 'unwatch_agenda') {
        ws.watchingAgendas = ws.watchingAgendas.filter(a => a !== data.agendaId);
      }
      
    } catch (err) {
      console.error('WebSocket mesaj hatası:', err);
    }
  });
  
  ws.on('close', () => {
    if (ws.userId && connectedClients.has(ws.userId)) {
      connectedClients.get(ws.userId).delete(ws);
      if (connectedClients.get(ws.userId).size === 0) {
        connectedClients.delete(ws.userId);
      }
      console.log(`👋 Kullanıcı ${ws.userId} ayrıldı`);
    }
  });
});

// Gündem izleyicilerine mesaj gönder
const broadcastToAgendaWatchers = (agendaId, data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.watchingAgendas?.includes(agendaId)) {
      client.send(JSON.stringify(data));
    }
  });
};

// =============================================
// MESSAGES API
// =============================================

// Get all messages for a project
app.get('/api/messages/:projectId', (req, res) => {
  const messages = readMessages();
  const projectMessages = messages.filter(m => m.projectId === req.params.projectId);
  res.json(projectMessages);
});

// Get all messages
app.get('/api/messages', (req, res) => {
  const messages = readMessages();
  res.json(messages);
});

// Create a new message
app.post('/api/messages', (req, res) => {
  const messages = readMessages();
  const newMessage = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  messages.push(newMessage);
  writeMessages(messages);
  
  // WebSocket ile projeyi izleyenlere bildir
  broadcastToProject(newMessage.projectId, {
    type: 'new_message',
    message: newMessage
  }, newMessage.userId);
  
  res.status(201).json(newMessage);
});

// Update a message
app.put('/api/messages/:id', (req, res) => {
  const messages = readMessages();
  const index = messages.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }
  messages[index] = { ...messages[index], ...req.body, editedAt: new Date().toISOString() };
  writeMessages(messages);
  
  // WebSocket ile projeyi izleyenlere bildir
  broadcastToProject(messages[index].projectId, {
    type: 'message_updated',
    message: messages[index]
  });
  
  res.json(messages[index]);
});

// Delete a message
app.delete('/api/messages/:id', (req, res) => {
  const messages = readMessages();
  const messageToDelete = messages.find(m => m.id === req.params.id);
  const filtered = messages.filter(m => m.id !== req.params.id);
  writeMessages(filtered);
  
  // WebSocket ile projeyi izleyenlere bildir
  if (messageToDelete) {
    broadcastToProject(messageToDelete.projectId, {
      type: 'message_deleted',
      messageId: req.params.id,
      projectId: messageToDelete.projectId
    });
  }
  
  res.status(204).send();
});

// =============================================
// AGENDA MESSAGES API
// =============================================

// Get all messages for an agenda
app.get('/api/agenda-messages/:agendaId', (req, res) => {
  const messages = readAgendaMessages();
  const agendaMessages = messages.filter(m => m.agendaId === req.params.agendaId);
  res.json(agendaMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
});

// Get all agenda messages
app.get('/api/agenda-messages', (req, res) => {
  const messages = readAgendaMessages();
  res.json(messages);
});

// Create a new agenda message
app.post('/api/agenda-messages', (req, res) => {
  const messages = readAgendaMessages();
  const newMessage = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  messages.push(newMessage);
  writeAgendaMessages(messages);
  
  // WebSocket ile gündemi izleyenlere bildir
  broadcastToAgendaWatchers(newMessage.agendaId, {
    type: 'new_agenda_message',
    message: newMessage
  });
  
  // Tüm kullanıcılara da bildir (global bildirim)
  broadcastAll({
    type: 'new_agenda_message',
    message: newMessage
  }, newMessage.userId);
  
  res.status(201).json(newMessage);
});

// Update an agenda message
app.put('/api/agenda-messages/:id', (req, res) => {
  const messages = readAgendaMessages();
  const index = messages.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Message not found' });
  }
  messages[index] = { ...messages[index], ...req.body, editedAt: new Date().toISOString() };
  writeAgendaMessages(messages);
  res.json(messages[index]);
});

// Delete an agenda message
app.delete('/api/agenda-messages/:id', (req, res) => {
  const messages = readAgendaMessages();
  const filtered = messages.filter(m => m.id !== req.params.id);
  writeAgendaMessages(filtered);
  res.status(204).send();
});

// =============================================
// NOTIFICATIONS API
// =============================================

// Get notifications for a user
app.get('/api/notifications/:userId', (req, res) => {
  const notifications = readNotifications();
  const userNotifications = notifications.filter(n => n.userId === req.params.userId);
  res.json(userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Create a notification
app.post('/api/notifications', (req, res) => {
  const notifications = readNotifications();
  const newNotification = {
    id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
    ...req.body,
    read: false,
    createdAt: new Date().toISOString()
  };
  notifications.push(newNotification);
  writeNotifications(notifications);
  
  // WebSocket ile kullanıcıya bildir
  broadcastToUsers([req.body.userId], {
    type: 'new_notification',
    notification: newNotification
  });
  
  res.status(201).json(newNotification);
});

// Mark notification as read
app.put('/api/notifications/:id/read', (req, res) => {
  const notifications = readNotifications();
  const index = notifications.findIndex(n => n.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  notifications[index].read = true;
  writeNotifications(notifications);
  res.json(notifications[index]);
});

// Delete old notifications (cleanup)
app.delete('/api/notifications/cleanup/:userId', (req, res) => {
  const notifications = readNotifications();
  const userNotifs = notifications.filter(n => n.userId === req.params.userId);
  const otherNotifs = notifications.filter(n => n.userId !== req.params.userId);
  // Keep only last 50 notifications per user
  const keptNotifs = userNotifs.slice(-50);
  writeNotifications([...otherNotifs, ...keptNotifs]);
  res.status(204).send();
});

// =============================================
// TASK TYPES API (Kayıt Türleri)
// =============================================

// Get all task types
app.get('/api/task-types', (req, res) => {
  const types = readTaskTypes();
  res.json(types);
});

// Create a new task type
app.post('/api/task-types', (req, res) => {
  const types = readTaskTypes();
  const { label, icon, color } = req.body;
  
  // ID oluştur (Türkçe karakterleri dönüştür)
  const id = label.toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ı/g, 'i')
    .replace(/[^a-z0-9]/g, '_');
  
  if (types.some(t => t.id === id)) {
    return res.status(400).json({ error: 'Bu isimde bir tür zaten var' });
  }
  
  const newType = { id, label, icon: icon || 'FileText', color: color || 'gray' };
  types.push(newType);
  writeTaskTypes(types);
  res.status(201).json(newType);
});

// Update a task type
app.put('/api/task-types/:id', (req, res) => {
  const types = readTaskTypes();
  const index = types.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Tür bulunamadı' });
  }
  types[index] = { ...types[index], ...req.body };
  writeTaskTypes(types);
  res.json(types[index]);
});

// Delete a task type
app.delete('/api/task-types/:id', (req, res) => {
  const types = readTaskTypes();
  const filtered = types.filter(t => t.id !== req.params.id);
  writeTaskTypes(filtered);
  res.status(204).send();
});

// Reset to default task types
app.post('/api/task-types/reset', (req, res) => {
  writeTaskTypes(DEFAULT_TASK_TYPES);
  res.json(DEFAULT_TASK_TYPES);
});

// =============================================
// CONTACTS API (Kişiler)
// =============================================

// Get all contacts
app.get('/api/contacts', (req, res) => {
  const contacts = readContacts();
  res.json(contacts);
});

// Search contacts by name
app.get('/api/contacts/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  
  const contacts = readContacts();
  const searchTerm = q.toLowerCase();
  const results = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm) ||
    (c.phone && c.phone.includes(searchTerm))
  );
  res.json(results);
});

// Create a new contact
app.post('/api/contacts', (req, res) => {
  const contacts = readContacts();
  const newContact = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  contacts.push(newContact);
  writeContacts(contacts);
  res.status(201).json(newContact);
});

// Update a contact
app.put('/api/contacts/:id', (req, res) => {
  const contacts = readContacts();
  const index = contacts.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Kişi bulunamadı' });
  }
  contacts[index] = { ...contacts[index], ...req.body, updatedAt: new Date().toISOString() };
  writeContacts(contacts);
  res.json(contacts[index]);
});

// Delete a contact
app.delete('/api/contacts/:id', (req, res) => {
  const contacts = readContacts();
  const filtered = contacts.filter(c => c.id !== req.params.id);
  writeContacts(filtered);
  res.status(204).send();
});

// =============================================
// STAFF API (Görevliler/Kullanıcılar)
// =============================================

// Get all staff
app.get('/api/staff', (req, res) => {
  const staff = readStaff();
  res.json(staff);
});

// Get staff by role
app.get('/api/staff/role/:role', (req, res) => {
  const staff = readStaff();
  const filtered = staff.filter(s => s.role === req.params.role && s.active);
  res.json(filtered);
});

// Create new staff
app.post('/api/staff', (req, res) => {
  const staff = readStaff();
  const newStaff = {
    id: Date.now().toString(),
    ...req.body,
    active: true,
    createdAt: new Date().toISOString()
  };
  staff.push(newStaff);
  writeStaff(staff);
  res.status(201).json(newStaff);
});

// Update staff
app.put('/api/staff/:id', (req, res) => {
  const staff = readStaff();
  const index = staff.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Görevli bulunamadı' });
  }
  staff[index] = { ...staff[index], ...req.body, updatedAt: new Date().toISOString() };
  writeStaff(staff);
  res.json(staff[index]);
});

// Delete staff (soft delete)
app.delete('/api/staff/:id', (req, res) => {
  const staff = readStaff();
  const index = staff.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Görevli bulunamadı' });
  }
  staff[index].active = false;
  writeStaff(staff);
  res.status(204).send();
});

// Hard delete staff
app.delete('/api/staff/:id/hard', (req, res) => {
  const staff = readStaff();
  const filtered = staff.filter(s => s.id !== req.params.id);
  writeStaff(filtered);
  res.status(204).send();
});

// Reset to default staff
app.post('/api/staff/reset', (req, res) => {
  writeStaff(DEFAULT_STAFF);
  res.json(DEFAULT_STAFF);
});

// Set password for staff (make them a user)
app.post('/api/staff/:id/set-password', (req, res) => {
  const staff = readStaff();
  const index = staff.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Görevli bulunamadı' });
  }
  
  const { password } = req.body;
  if (!password || password.length < 4) {
    return res.status(400).json({ error: 'Şifre en az 4 karakter olmalı' });
  }
  
  staff[index] = { 
    ...staff[index], 
    password, 
    isUser: true,
    updatedAt: new Date().toISOString() 
  };
  writeStaff(staff);
  
  // Şifre olmadan döndür
  const { password: _, ...safeStaff } = staff[index];
  res.json(safeStaff);
});

// Remove user access (remove password)
app.post('/api/staff/:id/remove-user', (req, res) => {
  const staff = readStaff();
  const index = staff.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Görevli bulunamadı' });
  }
  
  delete staff[index].password;
  staff[index].isUser = false;
  staff[index].updatedAt = new Date().toISOString();
  writeStaff(staff);
  res.json(staff[index]);
});

// Login via staff credentials
app.post('/api/staff/login', (req, res) => {
  const { name, password } = req.body;
  const staff = readStaff();
  
  // İsme göre ara (case-insensitive)
  const user = staff.find(s => 
    s.name.toLowerCase() === name.toLowerCase() && 
    s.isUser && 
    s.password === password &&
    s.active
  );
  
  if (!user) {
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
  }
  
  // Şifre olmadan döndür
  const { password: _, ...safeUser } = user;
  res.json({ 
    user: {
      ...safeUser,
      department: safeUser.title
    }
  });
});

// =============================================
// PROJECT TAGS API (Proje Etiketleri)
// =============================================

// Get all project tags
app.get('/api/project-tags', (req, res) => {
  const tags = readProjectTags();
  res.json(tags);
});

// Create a new project tag
app.post('/api/project-tags', (req, res) => {
  const tags = readProjectTags();
  const { label, color } = req.body;
  
  if (!label || !label.trim()) {
    return res.status(400).json({ error: 'Etiket adı gerekli' });
  }
  
  // ID oluştur (Türkçe karakterleri dönüştür)
  const id = label.toLowerCase()
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u')
    .replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/ı/g, 'i')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  if (tags.some(t => t.id === id || t.label.toLowerCase() === label.toLowerCase())) {
    return res.status(400).json({ error: 'Bu isimde bir etiket zaten var' });
  }
  
  const newTag = { 
    id, 
    label: label.trim(), 
    color: color || 'bg-gray-100 text-gray-700',
    createdAt: new Date().toISOString()
  };
  tags.push(newTag);
  writeProjectTags(tags);
  res.status(201).json(newTag);
});

// Update a project tag
app.put('/api/project-tags/:id', (req, res) => {
  const tags = readProjectTags();
  const index = tags.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Etiket bulunamadı' });
  }
  tags[index] = { ...tags[index], ...req.body, updatedAt: new Date().toISOString() };
  writeProjectTags(tags);
  res.json(tags[index]);
});

// Delete a project tag
app.delete('/api/project-tags/:id', (req, res) => {
  const tags = readProjectTags();
  const filtered = tags.filter(t => t.id !== req.params.id);
  writeProjectTags(filtered);
  res.status(204).send();
});

// Reset to default project tags
app.post('/api/project-tags/reset', (req, res) => {
  writeProjectTags(DEFAULT_PROJECT_TAGS);
  res.json(DEFAULT_PROJECT_TAGS);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Messages API running on http://0.0.0.0:${PORT}`);
  console.log(`🔌 WebSocket running on ws://0.0.0.0:${PORT}`);
  console.log(`   - Messages: http://localhost:${PORT}/api/messages`);
  console.log(`   - Notifications: http://localhost:${PORT}/api/notifications/:userId`);
  console.log(`   - Task Types: http://localhost:${PORT}/api/task-types`);
  console.log(`   - Contacts: http://localhost:${PORT}/api/contacts`);
  console.log(`   - Staff: http://localhost:${PORT}/api/staff`);
  console.log(`   - Project Tags: http://localhost:${PORT}/api/project-tags`);
});
