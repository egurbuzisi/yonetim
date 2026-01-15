export type UserRole = 'baskan' | 'ozel_kalem' | 'baskan_yardimcisi' | 'mudur' | 'personel';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  avatar: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateAvatar: (avatarBase64: string) => void;
  isAuthenticated: boolean;
}

export type ProjectStatus = 'beklemede' | 'planlandi' | 'devam_ediyor' | 'tamamlandi' | 'iptal' | 'dusunuluyor' | 'planlanmis';
export type ProjectPriority = 'dusuk' | 'orta' | 'yuksek' | 'acil';

export interface ProjectMessage {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  message: string;
  image?: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  createdBy: string;
  assignedTo: string[];
  visibleTo: string[];
  messages: ProjectMessage[];
  // 8080 uyumlu ek alanlar
  mahalle?: string;
  adaParsel?: string;
  firma?: string;
  photos?: string[];
  budget?: number;
  responsiblePerson?: string;
  tags?: string[];
}

export type AgendaStatus = 'bekliyor' | 'gorusuldu' | 'ertelendi' | 'iptal';
export type AgendaPriority = 'dusuk' | 'orta' | 'yuksek' | 'acil';

export interface AgendaMessage {
  id: string;
  agendaId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: Date;
}

export interface Agenda {
  id: string;
  title: string;
  description: string;
  status: AgendaStatus;
  priority: AgendaPriority;
  meetingDate?: Date;
  createdAt: Date;
  createdBy: string;
  assignedTo: string[];
  visibleTo: string[];
  messages: AgendaMessage[];
  mahalle?: string;
  tags?: string[];
  relatedTo?: string;
  relatedToName?: string;
}

export type TaskType = 'randevu' | 'talep' | 'dugun' | 'diger' | 'gorev';
export type TaskStatus = 'bekliyor' | 'tamamlandi' | 'iptal' | 'planlanmis' | 'beklemede' | 'islemde' | 'reddedildi';

export interface PendingTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  requesterName: string;
  requesterPhone: string;
  location?: string;
  scheduledDate?: Date;
  scheduledTime?: string;
  createdAt: Date;
  createdBy: string;
  assignedTo: string[];
  assignedToName?: string;
  visibleTo: string[];
  waitingDays: number;
  eventDate?: Date;
  eventTime?: string;
  category?: string;
}

export type ScheduleType = 'gunluk' | 'haftalik' | 'aylik' | 'talep' | 'dugun' | 'randevu' | 'gorev' | 'diger';
export type ScheduleStatus = 'planlanmis' | 'tamamlandi' | 'iptal' | 'devam_ediyor';

export interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  type: ScheduleType;
  status: ScheduleStatus;
  date: Date;
  startTime?: string;
  endTime?: string;
  time?: string;
  location?: string;
  createdBy: string;
  visibleTo: string[];
  assignedTo?: string;
  assignedToName?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
}

export interface Cenaze {
  id: string;
  adSoyad: string;
  yas?: number;
  mahalle: string;
  tarih: Date;
  saat?: string;
  cami?: string;
  mezarlik?: string;
  yakinAdi?: string;
  yakinTelefon?: string;
  yakinlik?: string;
  notlar?: string;
  gorevliId?: string;
  gorevliAdi?: string;
  arandi: boolean;
  aranmaTarihi?: Date;
  createdBy: string;
  visibleTo: string[];
}
