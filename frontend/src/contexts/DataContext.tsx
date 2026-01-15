import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Project, Agenda, PendingTask, ScheduleItem, Notification } from '../types';
import { projectsApi, agendasApi, pendingsApi, schedulesApi, cenazesApi, authApi, messagesApi, userNotificationsApi, agendaMessagesApi } from '../services/api';
import { wsService } from '../services/websocket';
import { playDoubleNotificationSound } from '../utils/notificationSound';

export const canUserView = (userId: string, userRole: string, visibleTo: string[] | undefined, createdBy?: string | number): boolean => {
  // Admin roller her şeyi görebilir
  if (userRole === 'baskan' || userRole === 'ozel_kalem') {
    return true;
  }
  // Oluşturan kişi görebilir
  if (createdBy !== undefined && String(createdBy) === String(userId)) {
    return true;
  }
  // visibleTo listesinde varsa görebilir
  if (visibleTo && Array.isArray(visibleTo) && visibleTo.includes(userId)) {
    return true;
  }
  // visibleTo boş veya undefined ise herkes görebilir
  if (!visibleTo || visibleTo.length === 0) {
    return true;
  }
  return false;
};

// Tüm kullanıcılar - API'den yüklenecek
export let allUsers: { id: string; name: string; role: string }[] = [];

interface Cenaze {
  id: string;
  vefatEden: string;
  tarih?: Date;
  saat?: string;
  namazVakti?: string;
  mahalle?: string;
  notlar?: string;
  yakinAdi?: string;
  yakinTelefon?: string;
  yakinlik?: string;
  baskanAradiMi: boolean;
  gorevliId?: string;
  gorevliAdi?: string;
  tamamlandi: boolean;
  createdBy: string;
  visibleTo: string[];
}

interface DataContextType {
  projects: Project[];
  agendas: Agenda[];
  pendingTasks: PendingTask[];
  scheduleItems: ScheduleItem[];
  cenazes: Cenaze[];
  notifications: Notification[];
  loading: boolean;
  getFilteredProjects: (userId: string, userRole: string) => Project[];
  getFilteredAgendas: (userId: string, userRole: string) => Agenda[];
  getFilteredPendingTasks: (userId: string, userRole: string) => PendingTask[];
  getFilteredScheduleItems: (userId: string, userRole: string) => ScheduleItem[];
  addProject: (project: any) => Promise<void>;
  addAgenda: (agenda: any) => Promise<void>;
  addPendingTask: (task: any) => Promise<void>;
  addScheduleItem: (item: any) => Promise<void>;
  updateProject: (id: string, updates: any) => Promise<void>;
  updateAgenda: (id: string, updates: any) => Promise<void>;
  updatePendingTask: (id: string, updates: any) => Promise<void>;
  updateScheduleItem: (id: string, updates: any) => Promise<void>;
  deleteScheduleItem: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  deleteAgenda: (id: string) => Promise<void>;
  deletePendingTask: (id: string) => Promise<void>;
  addProjectMessage: (projectId: string, message: string, userId: string, userName: string, image?: string) => void;
  editProjectMessage: (projectId: string, messageId: string, newMessage: string) => void;
  deleteProjectMessage: (projectId: string, messageId: string) => void;
  addAgendaMessage: (agendaId: string, message: string, userId: string, userName: string, attachment?: any) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  unreadNotificationCount: number;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [cenazes, setCenazes] = useState<Cenaze[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // API'den veri yükle
  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsData, agendasData, pendingsData, schedulesData, cenazesData, usersData, allMessagesData, allAgendaMessagesData] = await Promise.all([
        projectsApi.getAll().catch(() => []),
        agendasApi.getAll().catch(() => []),
        pendingsApi.getAll().catch(() => []),
        schedulesApi.getAll().catch(() => []),
        cenazesApi.getAll().catch(() => []),
        authApi.getUsers().catch(() => []),
        messagesApi.getAll().catch(() => []),
        agendaMessagesApi.getAll().catch(() => []),
      ]);

      // Kullanıcıları güncelle
      allUsers = usersData.map((u: any) => ({
        id: String(u.id),
        name: u.name,
        role: u.role,
      }));

      // Projeleri dönüştür - API'den mesajları al
      setProjects(projectsData.map((p: any) => {
        const projectId = String(p.id);
        // API'den gelen mesajları filtrele
        const projectMessages = allMessagesData.filter((m: any) => m.projectId === projectId);
        
        return {
          id: projectId,
          title: p.title,
          description: p.description || '',
          status: p.status || 'beklemede',
          priority: p.priority || 'orta',
          progress: p.progress || 0,
          startDate: p.startDate ? new Date(p.startDate) : new Date(),
          endDate: p.endDate ? new Date(p.endDate) : undefined,
          createdBy: String(p.createdBy),
          assignedTo: (p.assignedTo || []).map(String),
          visibleTo: (p.visibleTo || []).map(String),
          createdAt: new Date(p.createdAt),
          messages: projectMessages,
        };
      }));
      
      // Kullanıcının bildirimlerini API'den yükle
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          const userNotifs = await userNotificationsApi.getByUser(userData.id).catch(() => []);
          setNotifications(userNotifs);
        }
      } catch { /* ignore */ }

      // Gündemleri dönüştür - API'den mesajları al
      setAgendas(agendasData.map((a: any) => {
        const agendaId = String(a.id);
        // API'den gelen mesajları filtrele
        const agendaMessages = allAgendaMessagesData.filter((m: any) => m.agendaId === agendaId);
        
        return {
          id: agendaId,
          title: a.title,
          description: a.description || '',
          status: a.status || 'bekliyor',
          priority: a.priority || 'orta',
          meetingDate: a.date ? new Date(a.date) : undefined,
          createdBy: String(a.createdBy),
          assignedTo: (a.assignedTo || []).map(String),
          visibleTo: (a.visibleTo || []).map(String),
          createdAt: new Date(a.createdAt),
          mahalle: a.mahalle || '',
          tags: a.tags || [],
          relatedTo: a.relatedTo || '',
          relatedToName: a.relatedToName || '',
          messages: agendaMessages,
        };
      }));

      // Bekleyenleri dönüştür
      setPendingTasks(pendingsData.map((p: any) => ({
        id: String(p.id),
        title: p.title,
        description: p.description || '',
        type: p.type || 'diger',
        status: p.status || 'bekliyor',
        requesterName: p.requesterName || '',
        requesterPhone: p.requesterPhone || '',
        location: p.location,
        scheduledDate: p.scheduledDate ? new Date(p.scheduledDate) : undefined,
        createdBy: String(p.createdBy),
        assignedTo: (p.assignedTo || []).map(String),
        visibleTo: (p.visibleTo || []).map(String),
        createdAt: new Date(p.createdAt),
        waitingDays: Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      })));

      // Programları dönüştür
      setScheduleItems(schedulesData.map((s: any) => ({
        id: String(s.id),
        title: s.title,
        description: s.description || '',
        type: s.type || 'gunluk',
        status: 'planlanmis',
        date: new Date(s.date),
        time: s.startTime,
        location: s.location,
        createdBy: String(s.createdBy),
        visibleTo: [],
      })));

      // Cenazeleri dönüştür
      setCenazes(cenazesData.map((c: any) => ({
        id: String(c.id),
        vefatEden: c.vefatEden,
        tarih: c.tarih ? new Date(c.tarih) : undefined,
        saat: c.saat,
        namazVakti: c.namazVakti,
        mahalle: c.mahalle,
        notlar: c.notlar,
        yakinAdi: c.yakinAdi,
        yakinTelefon: c.yakinTelefon,
        yakinlik: c.yakinlik,
        baskanAradiMi: c.baskanAradiMi,
        gorevliId: c.gorevliId ? String(c.gorevliId) : undefined,
        gorevliAdi: c.gorevliAdi,
        tamamlandi: c.tamamlandi,
        createdBy: String(c.createdBy),
        visibleTo: (c.visibleTo || []).map(String),
      })));

    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // WebSocket bağlantısı ve event handlers
  useEffect(() => {
    // Kullanıcı bilgisini al
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    
    const userData = JSON.parse(savedUser);
    
    // WebSocket'e bağlan
    wsService.connect(userData.id);
    
    // Yeni mesaj geldiğinde
    const unsubNewMessage = wsService.on('new_message', (data) => {
      setProjects(prev => prev.map(p => 
        p.id === data.message.projectId 
          ? { ...p, messages: [...p.messages, data.message] }
          : p
      ));
    });
    
    // Mesaj güncellendiğinde
    const unsubMessageUpdated = wsService.on('message_updated', (data) => {
      setProjects(prev => prev.map(p => 
        p.id === data.message.projectId 
          ? { 
              ...p, 
              messages: p.messages.map(m => 
                m.id === data.message.id ? data.message : m
              )
            }
          : p
      ));
    });
    
    // Mesaj silindiğinde
    const unsubMessageDeleted = wsService.on('message_deleted', (data) => {
      setProjects(prev => prev.map(p => 
        p.id === data.projectId 
          ? { ...p, messages: p.messages.filter(m => m.id !== data.messageId) }
          : p
      ));
    });
    
    // Yeni bildirim geldiğinde
    const unsubNewNotification = wsService.on('new_notification', (data) => {
      setNotifications(prev => [data.notification, ...prev]);
      // Zil sesi çal
      playDoubleNotificationSound();
    });
    
    // Cleanup
    return () => {
      unsubNewMessage();
      unsubMessageUpdated();
      unsubMessageDeleted();
      unsubNewNotification();
      wsService.disconnect();
    };
  }, []);

  const refreshData = async () => {
    await loadData();
  };

  const getFilteredProjects = (userId: string, userRole: string) => {
    return projects.filter(p => canUserView(userId, userRole, p.visibleTo, p.createdBy));
  };

  const getFilteredAgendas = (userId: string, userRole: string) => {
    return agendas.filter(a => canUserView(userId, userRole, a.visibleTo, a.createdBy));
  };

  const getFilteredPendingTasks = (userId: string, userRole: string) => {
    return pendingTasks.filter(t => canUserView(userId, userRole, t.visibleTo, t.createdBy));
  };

  const getFilteredScheduleItems = (userId: string, userRole: string) => {
    return scheduleItems.filter(s => canUserView(userId, userRole, s.visibleTo, s.createdBy));
  };

  const addProject = async (project: any) => {
    try {
      await projectsApi.create(project);
      await refreshData();
    } catch (error) {
      console.error('Proje eklenirken hata:', error);
    }
  };

  const addAgenda = async (agenda: any) => {
    try {
      await agendasApi.create(agenda);
      await refreshData();
    } catch (error) {
      console.error('Gündem eklenirken hata:', error);
    }
  };

  const addPendingTask = async (task: any) => {
    try {
      const result = await pendingsApi.create(task);
      // Yeni kaydı hemen state'e ekle
      if (result) {
        setPendingTasks(prev => [...prev, result]);
      } else {
        await refreshData();
      }
    } catch (error) {
      console.error('Bekleyen eklenirken hata:', error);
      throw error;
    }
  };

  const addScheduleItem = async (item: any) => {
    try {
      // Tarih ve saati birleştir
      let scheduleDate = new Date(item.date);
      if (item.time) {
        const [hours, mins] = item.time.split(':').map(Number);
        scheduleDate.setHours(hours, mins, 0, 0);
      }
      
      // Backend'e gönderilecek veri
      const dataToSend = {
        ...item,
        date: scheduleDate.toISOString(),
        startTime: item.time, // Backend startTime bekliyor
      };
      
      const result = await schedulesApi.create(dataToSend);
      // Yeni kaydı hemen state'e ekle
      if (result) {
        setScheduleItems(prev => [...prev, {
          ...result,
          id: String(result.id),
          time: result.startTime || item.time || null,
        }]);
      } else {
        await refreshData();
      }
    } catch (error) {
      console.error('Program eklenirken hata:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: any) => {
    // Önce local state'i güncelle (hızlı UI güncellemesi)
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
    
    // Sonra API'yi çağır
    try {
      await projectsApi.update(Number(id), updates);
    } catch (error) {
      console.error('Proje güncellenirken hata:', error);
      // Hata olsa bile local state güncel kalır
    }
  };

  const updateAgenda = async (id: string, updates: any) => {
    try {
      await agendasApi.update(Number(id), updates);
      await refreshData();
    } catch (error) {
      console.error('Gündem güncellenirken hata:', error);
    }
  };

  const updatePendingTask = async (id: string, updates: any) => {
    // Optimistic update - önce UI'da güncelle
    const previousTasks = [...pendingTasks];
    setPendingTasks(prev => prev.map(task => 
      String(task.id) === String(id) ? { ...task, ...updates } : task
    ));
    
    try {
      await pendingsApi.update(Number(id), updates);
    } catch (error) {
      console.error('Bekleyen güncellenirken hata:', error);
      // Hata olursa geri al
      setPendingTasks(previousTasks);
      throw error;
    }
  };

  const updateScheduleItem = async (id: string, updates: any) => {
    // Optimistic update - önce UI'da güncelle
    const previousItems = [...scheduleItems];
    setScheduleItems(prev => prev.map(item => 
      String(item.id) === String(id) ? { ...item, ...updates } : item
    ));
    
    try {
      await schedulesApi.update(Number(id), updates);
    } catch (error) {
      console.error('Program güncellenirken hata:', error);
      // Hata olursa geri al
      setScheduleItems(previousItems);
    }
  };

  const deleteScheduleItem = async (id: string) => {
    // Optimistic update - önce UI'dan kaldır
    const previousItems = [...scheduleItems];
    setScheduleItems(prev => prev.filter(item => String(item.id) !== String(id)));
    
    try {
      await schedulesApi.delete(Number(id));
    } catch (error) {
      console.error('Program silinirken hata:', error);
      // Hata olursa geri al
      setScheduleItems(previousItems);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectsApi.delete(Number(id));
      await refreshData();
    } catch (error) {
      console.error('Proje silinirken hata:', error);
    }
  };

  const deleteAgenda = async (id: string) => {
    try {
      await agendasApi.delete(Number(id));
      await refreshData();
    } catch (error) {
      console.error('Gündem silinirken hata:', error);
    }
  };

  const deletePendingTask = async (id: string) => {
    // Optimistic update - önce UI'dan kaldır
    const previousTasks = [...pendingTasks];
    setPendingTasks(prev => prev.filter(task => String(task.id) !== String(id)));
    
    try {
      await pendingsApi.delete(Number(id));
    } catch (error) {
      console.error('Bekleyen silinirken hata:', error);
      // Hata olursa geri al
      setPendingTasks(previousTasks);
    }
  };

  // Bildirim oluştur ve API'ye kaydet
  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>, targetUserId?: string) => {
    if (targetUserId) {
      try {
        await userNotificationsApi.create({
          userId: targetUserId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          link: notification.link,
        });
      } catch (error) {
        console.error('Bildirim oluşturulurken hata:', error);
      }
    }
  };

  // Mesaj ekle ve API'ye kaydet
  const addProjectMessage = async (projectId: string, message: string, userId: string, userName: string, image?: string) => {
    try {
      // API'ye kaydet
      const newMessage = await messagesApi.create({
        projectId,
        userId,
        userName,
        message,
        image,
      });
      
      // State'e ekle
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, messages: [...p.messages, newMessage] }
          : p
      ));

      // Projeyi gören herkese bildirim gönder (mesajı yazan hariç)
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const notifyUsers = [...new Set([...(project.visibleTo || []), project.createdBy].filter(Boolean))].filter(id => id !== userId);
        
        // Tüm bildirimleri paralel gönder
        await Promise.all(notifyUsers.map(targetUserId => 
          userNotificationsApi.create({
            userId: targetUserId,
            title: `${project.title} - Yeni Mesaj`,
            message: `${userName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
            type: 'info',
            link: `/projects/${projectId}`,
          }).catch(err => console.error('Bildirim hatası:', err))
        ));
      }
    } catch (error) {
      console.error('Mesaj eklenirken hata:', error);
    }
  };

  // Mesaj düzenle
  const editProjectMessage = async (projectId: string, messageId: string, newMessage: string) => {
    try {
      // API'yi güncelle
      await messagesApi.update(messageId, { message: newMessage });
      
      // State'i güncelle
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { 
              ...p, 
              messages: p.messages.map(m => 
                m.id === messageId 
                  ? { ...m, message: newMessage, editedAt: new Date() }
                  : m
              )
            }
          : p
      ));
    } catch (error) {
      console.error('Mesaj düzenlenirken hata:', error);
    }
  };

  // Mesaj sil
  const deleteProjectMessage = async (projectId: string, messageId: string) => {
    try {
      // API'den sil
      await messagesApi.delete(messageId);
      
      // State'i güncelle
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, messages: p.messages.filter(m => m.id !== messageId) }
          : p
      ));
    } catch (error) {
      console.error('Mesaj silinirken hata:', error);
    }
  };

  const addAgendaMessage = async (agendaId: string, message: string, userId: string, userName: string, attachment?: any) => {
    try {
      // API'ye kaydet
      const newMessage = await agendaMessagesApi.create({
        agendaId,
        userId,
        userName,
        message,
        attachment,
      });
      
      // State'e ekle (API dönmezse local olarak ekle)
      const messageToAdd = newMessage || {
        id: Date.now().toString(),
        agendaId,
        userId,
        userName,
        message,
        attachment,
        createdAt: new Date(),
      };
      
      setAgendas(prev => prev.map(a => 
        a.id === agendaId 
          ? { ...a, messages: [...(a.messages || []), messageToAdd] }
          : a
      ));

      // Gündemi gören herkese bildirim gönder (mesajı yazan hariç)
      const agenda = agendas.find(a => a.id === agendaId);
      if (agenda) {
        const notifyUsers = [...new Set([...(agenda.visibleTo || []), agenda.createdBy].filter(Boolean))].filter(id => id !== userId);
        
        // Tüm bildirimleri paralel gönder
        await Promise.all(notifyUsers.map(targetUserId => 
          userNotificationsApi.create({
            userId: targetUserId,
            title: `${agenda.title} - Yeni Mesaj`,
            message: `${userName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
            type: 'info',
            link: `/agenda/${agendaId}`,
          }).catch(err => console.error('Bildirim hatası:', err))
        ));
      }
    } catch (error) {
      console.error('Gündem mesajı eklenirken hata:', error);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      // API'de okundu olarak işaretle
      await userNotificationsApi.markAsRead(id);
      
      // State'i güncelle
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Bildirim işaretlenirken hata:', error);
    }
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <DataContext.Provider value={{
      projects,
      agendas,
      pendingTasks,
      scheduleItems,
      cenazes,
      notifications,
      loading,
      getFilteredProjects,
      getFilteredAgendas,
      getFilteredPendingTasks,
      getFilteredScheduleItems,
      addProject,
      addAgenda,
      addPendingTask,
      addScheduleItem,
      updateProject,
      updateAgenda,
      updatePendingTask,
      updateScheduleItem,
      deleteScheduleItem,
      deleteProject,
      deleteAgenda,
      deletePendingTask,
      addProjectMessage,
      editProjectMessage,
      deleteProjectMessage,
      addAgendaMessage,
      addNotification,
      markNotificationRead,
      unreadNotificationCount,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
