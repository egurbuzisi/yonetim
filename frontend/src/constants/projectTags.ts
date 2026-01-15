// Proje etiketleri
export const PROJECT_TAGS = [
  { id: 'kapali_pazar', label: 'Kapalı Pazar Alanı', color: 'bg-orange-100 text-orange-700', icon: '🏪' },
  { id: 'cafe', label: 'Cafe', color: 'bg-amber-100 text-amber-700', icon: '☕' },
  { id: 'kentsel_donusum', label: 'Kentsel Dönüşüm', color: 'bg-blue-100 text-blue-700', icon: '🏗️' },
  { id: 'tadilat', label: 'Tadilat', color: 'bg-yellow-100 text-yellow-700', icon: '🔧' },
  { id: 'ges_projesi', label: 'GES Projesi', color: 'bg-green-100 text-green-700', icon: '☀️' },
  { id: 'plan_proje', label: 'Plan Proje İşi', color: 'bg-purple-100 text-purple-700', icon: '📐' },
  { id: 'yol_calismasi', label: 'Yol Çalışması', color: 'bg-gray-100 text-gray-700', icon: '🛣️' },
  { id: 'park_bahce', label: 'Park & Bahçe', color: 'bg-emerald-100 text-emerald-700', icon: '🌳' },
  { id: 'altyapi', label: 'Altyapı', color: 'bg-slate-100 text-slate-700', icon: '🔌' },
  { id: 'sosyal_tesis', label: 'Sosyal Tesis', color: 'bg-pink-100 text-pink-700', icon: '🏢' },
  { id: 'egitim', label: 'Eğitim', color: 'bg-indigo-100 text-indigo-700', icon: '📚' },
  { id: 'spor', label: 'Spor Tesisi', color: 'bg-red-100 text-red-700', icon: '⚽' },
];

export const getTagById = (id: string) => PROJECT_TAGS.find(t => t.id === id);
export const getTagColor = (id: string) => getTagById(id)?.color || 'bg-gray-100 text-gray-700';
export const getTagLabel = (id: string) => getTagById(id)?.label || id;
export const getTagIcon = (id: string) => getTagById(id)?.icon || '🏷️';
