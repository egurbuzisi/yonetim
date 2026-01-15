// Gündem etiketleri
export const AGENDA_TAGS = [
  { id: 'toplanti', label: 'Toplantı', color: 'bg-blue-100 text-blue-700', icon: '📋' },
  { id: 'vatandas', label: 'Vatandaş Talebi', color: 'bg-green-100 text-green-700', icon: '👥' },
  { id: 'sikayet', label: 'Şikayet', color: 'bg-red-100 text-red-700', icon: '⚠️' },
  { id: 'proje', label: 'Proje Görüşme', color: 'bg-purple-100 text-purple-700', icon: '🏗️' },
  { id: 'butce', label: 'Bütçe', color: 'bg-yellow-100 text-yellow-700', icon: '💰' },
  { id: 'personel', label: 'Personel', color: 'bg-orange-100 text-orange-700', icon: '👔' },
  { id: 'hukuk', label: 'Hukuk', color: 'bg-gray-100 text-gray-700', icon: '⚖️' },
  { id: 'imar', label: 'İmar', color: 'bg-cyan-100 text-cyan-700', icon: '🏛️' },
  { id: 'cevresel', label: 'Çevresel', color: 'bg-emerald-100 text-emerald-700', icon: '🌿' },
  { id: 'altyapi', label: 'Altyapı', color: 'bg-slate-100 text-slate-700', icon: '🔧' },
  { id: 'sosyal', label: 'Sosyal Hizmet', color: 'bg-pink-100 text-pink-700', icon: '🤝' },
  { id: 'acil', label: 'Acil Durum', color: 'bg-rose-100 text-rose-700', icon: '🚨' },
];

export const getAgendaTagById = (id: string) => AGENDA_TAGS.find(t => t.id === id);
export const getAgendaTagColor = (id: string) => getAgendaTagById(id)?.color || 'bg-gray-100 text-gray-700';
export const getAgendaTagLabel = (id: string) => getAgendaTagById(id)?.label || id;
export const getAgendaTagIcon = (id: string) => getAgendaTagById(id)?.icon || '🏷️';
