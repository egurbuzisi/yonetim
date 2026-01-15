// Proxy üzerinden API erişimi - telefondan da çalışır
const API_BASE = '/main-api';
const MESSAGES_API_BASE = '/messages-api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  // 204 No Content veya boş yanıt kontrolü
  const text = await response.text();
  return text ? JSON.parse(text) : (null as T);
}

// Messages API için ayrı request
async function messagesRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${MESSAGES_API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`Messages API error: ${response.status}`);
  }
  
  // DELETE için boş yanıt dönebilir
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// Auth API
export const authApi = {
  login: (name: string, password: string) => 
    request<{ user?: any; error?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    }),
  getUsers: () => request<any[]>('/users'),
};

// Projects API
export const projectsApi = {
  getAll: () => request<any[]>('/projects'),
  getById: (id: number) => request<any>(`/projects/${id}`),
  create: (data: any) => request<any>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request<any>(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request<void>(`/projects/${id}`, {
    method: 'DELETE',
  }),
};

// Agendas API
export const agendasApi = {
  getAll: () => request<any[]>('/agendas'),
  getById: (id: number) => request<any>(`/agendas/${id}`),
  create: (data: any) => request<any>('/agendas', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request<any>(`/agendas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request<void>(`/agendas/${id}`, {
    method: 'DELETE',
  }),
};

// Pendings API
export const pendingsApi = {
  getAll: () => request<any[]>('/pendings'),
  getById: (id: number) => request<any>(`/pendings/${id}`),
  create: (data: any) => request<any>('/pendings', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request<any>(`/pendings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request<void>(`/pendings/${id}`, {
    method: 'DELETE',
  }),
};

// Schedules API
export const schedulesApi = {
  getAll: () => request<any[]>('/schedules'),
  getById: (id: number) => request<any>(`/schedules/${id}`),
  create: (data: any) => request<any>('/schedules', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request<any>(`/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request<void>(`/schedules/${id}`, {
    method: 'DELETE',
  }),
};

// Cenazes API
export const cenazesApi = {
  getAll: () => request<any[]>('/cenazes'),
  getById: (id: number) => request<any>(`/cenazes/${id}`),
  create: (data: any) => request<any>('/cenazes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: number, data: any) => request<any>(`/cenazes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: number) => request<void>(`/cenazes/${id}`, {
    method: 'DELETE',
  }),
};

// Notifications API (eski - kullanılmıyor)
export const notificationsApi = {
  getAll: () => request<any[]>('/notifications'),
  markAsRead: (id: number) => request<void>(`/notifications/${id}/read`, {
    method: 'PUT',
  }),
};

// =============================================
// MESSAGES API (Port 5001)
// =============================================
export const messagesApi = {
  // Proje mesajlarını getir
  getByProject: (projectId: string) => 
    messagesRequest<any[]>(`/messages/${projectId}`),
  
  // Tüm mesajları getir
  getAll: () => 
    messagesRequest<any[]>('/messages'),
  
  // Yeni mesaj oluştur
  create: (data: { projectId: string; userId: string; userName: string; message: string; image?: string }) => 
    messagesRequest<any>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Mesaj güncelle
  update: (id: string, data: { message: string }) => 
    messagesRequest<any>(`/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Mesaj sil
  delete: (id: string) => 
    messagesRequest<void>(`/messages/${id}`, {
      method: 'DELETE',
    }),
};

// =============================================
// AGENDA MESSAGES API (Port 5001)
// =============================================
export const agendaMessagesApi = {
  // Gündem mesajlarını getir
  getByAgenda: (agendaId: string) => 
    messagesRequest<any[]>(`/agenda-messages/${agendaId}`),
  
  // Tüm gündem mesajlarını getir
  getAll: () => 
    messagesRequest<any[]>('/agenda-messages'),
  
  // Yeni mesaj oluştur
  create: (data: { agendaId: string; userId: string; userName: string; message: string }) => 
    messagesRequest<any>('/agenda-messages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Mesaj güncelle
  update: (id: string, data: { message: string }) => 
    messagesRequest<any>(`/agenda-messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Mesaj sil
  delete: (id: string) => 
    messagesRequest<void>(`/agenda-messages/${id}`, {
      method: 'DELETE',
    }),
};

// =============================================
// NOTIFICATIONS API (Port 5001)
// =============================================
export const userNotificationsApi = {
  // Kullanıcının bildirimlerini getir
  getByUser: (userId: string) => 
    messagesRequest<any[]>(`/notifications/${userId}`),
  
  // Yeni bildirim oluştur
  create: (data: { userId: string; title: string; message: string; type: string; link?: string }) => 
    messagesRequest<any>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Bildirimi okundu olarak işaretle
  markAsRead: (id: string) => 
    messagesRequest<any>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
};

// =============================================
// TASK TYPES API (Port 5001) - Kayıt Türleri
// =============================================
export const taskTypesApi = {
  // Tüm türleri getir
  getAll: () => messagesRequest<any[]>('/task-types'),
  
  // Yeni tür oluştur
  create: (data: { label: string; icon?: string; color?: string }) => 
    messagesRequest<any>('/task-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Tür güncelle
  update: (id: string, data: { label?: string; icon?: string; color?: string }) => 
    messagesRequest<any>(`/task-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Tür sil
  delete: (id: string) => 
    messagesRequest<void>(`/task-types/${id}`, {
      method: 'DELETE',
    }),
  
  // Varsayılana sıfırla
  reset: () => 
    messagesRequest<any[]>('/task-types/reset', {
      method: 'POST',
    }),
};

// =============================================
// CONTACTS API (Port 5001) - Kişiler
// =============================================
export const contactsApi = {
  // Tüm kişileri getir
  getAll: () => messagesRequest<any[]>('/contacts'),
  
  // Kişi ara
  search: (query: string) => 
    messagesRequest<any[]>(`/contacts/search?q=${encodeURIComponent(query)}`),
  
  // Yeni kişi oluştur
  create: (data: { name: string; phone?: string; address?: string; neighborhood?: string }) => 
    messagesRequest<any>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Kişi güncelle
  update: (id: string, data: any) => 
    messagesRequest<any>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Kişi sil
  delete: (id: string) => 
    messagesRequest<void>(`/contacts/${id}`, {
      method: 'DELETE',
    }),
};

// =============================================
// STAFF API (Port 5001) - Görevliler/Kullanıcılar
// =============================================
export const staffApi = {
  // Tüm görevlileri getir
  getAll: () => messagesRequest<any[]>('/staff'),
  
  // Role göre getir
  getByRole: (role: string) => messagesRequest<any[]>(`/staff/role/${role}`),
  
  // Yeni görevli oluştur
  create: (data: { name: string; role: string; title: string; phone?: string }) => 
    messagesRequest<any>('/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Görevli güncelle
  update: (id: string, data: any) => 
    messagesRequest<any>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Görevli sil (soft delete)
  delete: (id: string) => 
    messagesRequest<void>(`/staff/${id}`, {
      method: 'DELETE',
    }),
  
  // Görevli kalıcı sil
  hardDelete: (id: string) => 
    messagesRequest<void>(`/staff/${id}/hard`, {
      method: 'DELETE',
    }),
  
  // Varsayılana sıfırla
  reset: () => 
    messagesRequest<any[]>('/staff/reset', {
      method: 'POST',
    }),
  
  // Şifre belirle (kullanıcı yap)
  setPassword: (id: string, password: string) =>
    messagesRequest<any>(`/staff/${id}/set-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
  
  // Kullanıcı yetkisini kaldır
  removeUser: (id: string) =>
    messagesRequest<any>(`/staff/${id}/remove-user`, {
      method: 'POST',
    }),
  
  // Staff ile giriş yap
  login: (name: string, password: string) =>
    messagesRequest<{ user?: any; error?: string }>('/staff/login', {
      method: 'POST',
      body: JSON.stringify({ name, password }),
    }),
};

// =============================================
// PROJECT TAGS API (Port 5001) - Proje Etiketleri
// =============================================
export const projectTagsApi = {
  // Tüm etiketleri getir
  getAll: () => messagesRequest<any[]>('/project-tags'),
  
  // Yeni etiket oluştur
  create: (data: { label: string; color?: string }) => 
    messagesRequest<any>('/project-tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Etiket güncelle
  update: (id: string, data: { label?: string; color?: string }) => 
    messagesRequest<any>(`/project-tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  // Etiket sil
  delete: (id: string) => 
    messagesRequest<void>(`/project-tags/${id}`, {
      method: 'DELETE',
    }),
  
  // Varsayılana sıfırla
  reset: () => 
    messagesRequest<any[]>('/project-tags/reset', {
      method: 'POST',
    }),
};
