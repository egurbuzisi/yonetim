import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, X, Heart, MessageSquare, Calendar, Briefcase, FileText, Phone, Mail, User, Users, Home, Building, Car, Truck, AlertCircle, CheckCircle, Star, Gift, Coffee, RotateCcw } from 'lucide-react';
import { taskTypesApi } from '../services/api';

// İkon map
const ICONS: Record<string, any> = {
  MessageSquare, Heart, Calendar, Briefcase, FileText, Phone, Mail, User, Users, Home, Building, Car, Truck, AlertCircle, CheckCircle, Star, Gift, Coffee
};

// Renk seçenekleri
const COLOR_OPTIONS = [
  { id: 'blue', label: 'Mavi', bg: 'bg-blue-100', text: 'text-blue-600', activeBg: 'bg-blue-600', border: 'border-blue-500' },
  { id: 'pink', label: 'Pembe', bg: 'bg-pink-100', text: 'text-pink-600', activeBg: 'bg-pink-600', border: 'border-pink-500' },
  { id: 'green', label: 'Yeşil', bg: 'bg-green-100', text: 'text-green-600', activeBg: 'bg-green-600', border: 'border-green-500' },
  { id: 'purple', label: 'Mor', bg: 'bg-purple-100', text: 'text-purple-600', activeBg: 'bg-purple-600', border: 'border-purple-500' },
  { id: 'orange', label: 'Turuncu', bg: 'bg-orange-100', text: 'text-orange-600', activeBg: 'bg-orange-600', border: 'border-orange-500' },
  { id: 'red', label: 'Kırmızı', bg: 'bg-red-100', text: 'text-red-600', activeBg: 'bg-red-600', border: 'border-red-500' },
  { id: 'cyan', label: 'Camgöbeği', bg: 'bg-cyan-100', text: 'text-cyan-600', activeBg: 'bg-cyan-600', border: 'border-cyan-500' },
  { id: 'yellow', label: 'Sarı', bg: 'bg-yellow-100', text: 'text-yellow-600', activeBg: 'bg-yellow-600', border: 'border-yellow-500' },
  { id: 'gray', label: 'Gri', bg: 'bg-gray-100', text: 'text-gray-600', activeBg: 'bg-gray-600', border: 'border-gray-500' },
];

// İkon seçenekleri
const ICON_OPTIONS = [
  { id: 'MessageSquare', label: 'Mesaj' },
  { id: 'Heart', label: 'Kalp' },
  { id: 'Calendar', label: 'Takvim' },
  { id: 'Briefcase', label: 'Çanta' },
  { id: 'FileText', label: 'Dosya' },
  { id: 'Phone', label: 'Telefon' },
  { id: 'Mail', label: 'E-posta' },
  { id: 'User', label: 'Kullanıcı' },
  { id: 'Users', label: 'Grup' },
  { id: 'Home', label: 'Ev' },
  { id: 'Building', label: 'Bina' },
  { id: 'Car', label: 'Araç' },
  { id: 'Truck', label: 'Kamyon' },
  { id: 'AlertCircle', label: 'Uyarı' },
  { id: 'CheckCircle', label: 'Onay' },
  { id: 'Star', label: 'Yıldız' },
  { id: 'Gift', label: 'Hediye' },
  { id: 'Coffee', label: 'Kahve' },
];

interface TaskType {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export default function TaskTypesPage() {
  const navigate = useNavigate();
  const [types, setTypes] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingType, setEditingType] = useState<TaskType | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState({ label: '', icon: 'FileText', color: 'gray' });

  // Verileri yükle
  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const data = await taskTypesApi.getAll();
      setTypes(data);
    } catch (error) {
      console.error('Türler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newType.label.trim()) {
      alert('Tür adı gerekli!');
      return;
    }
    
    try {
      const created = await taskTypesApi.create(newType);
      setTypes([...types, created]);
      setNewType({ label: '', icon: 'FileText', color: 'gray' });
      setIsAdding(false);
    } catch (error: any) {
      alert(error.message || 'Tür eklenirken hata oluştu');
    }
  };

  const handleUpdate = async () => {
    if (!editingType) return;
    
    try {
      await taskTypesApi.update(editingType.id, editingType);
      setTypes(types.map(t => t.id === editingType.id ? editingType : t));
      setEditingType(null);
    } catch (error) {
      console.error('Tür güncellenirken hata:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kayıt türünü silmek istediğinize emin misiniz?')) return;
    
    try {
      await taskTypesApi.delete(id);
      setTypes(types.filter(t => t.id !== id));
    } catch (error) {
      console.error('Tür silinirken hata:', error);
    }
  };

  const handleReset = async () => {
    if (!confirm('Varsayılan türlere dönmek istediğinize emin misiniz?')) return;
    
    try {
      const data = await taskTypesApi.reset();
      setTypes(data);
    } catch (error) {
      console.error('Sıfırlanırken hata:', error);
    }
  };

  const getColorClass = (colorId: string) => {
    return COLOR_OPTIONS.find(c => c.id === colorId) || COLOR_OPTIONS[8];
  };

  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = ICONS[iconName] || FileText;
    return <IconComponent className={className} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
        <ArrowLeft className="w-5 h-5" />
        <span>Geri</span>
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Kayıt Türleri</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          <Plus className="w-4 h-4" />
          Yeni Tür
        </button>
      </div>

      {/* Tür Listesi */}
      <div className="space-y-3">
        {types.map(type => {
          const colorClass = getColorClass(type.color);
          const isEditing = editingType?.id === type.id;

          if (isEditing) {
            return (
              <div key={type.id} className="bg-white rounded-xl p-4 shadow-sm border-2 border-orange-400">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tür Adı</label>
                    <input
                      type="text"
                      value={editingType.label}
                      onChange={(e) => setEditingType({ ...editingType, label: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">İkon</label>
                    <div className="flex flex-wrap gap-2">
                      {ICON_OPTIONS.map(icon => (
                        <button
                          key={icon.id}
                          type="button"
                          onClick={() => setEditingType({ ...editingType, icon: icon.id })}
                          className={`p-2 rounded-lg border ${
                            editingType.icon === icon.id 
                              ? 'bg-orange-100 border-orange-400' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          title={icon.label}
                        >
                          {renderIcon(icon.id, 'w-4 h-4')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Renk</label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map(color => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setEditingType({ ...editingType, color: color.id })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${color.bg} ${color.text} ${
                            editingType.color === color.id ? 'ring-2 ring-offset-1 ring-orange-400' : ''
                          }`}
                        >
                          {color.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingType(null)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={type.id} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${colorClass.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClass.bg}`}>
                    {renderIcon(type.icon, `w-5 h-5 ${colorClass.text}`)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{type.label}</p>
                    <p className="text-xs text-gray-400">ID: {type.id}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingType(type)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Yeni Tür Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Yeni Kayıt Türü</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tür Adı *</label>
                <input
                  type="text"
                  value={newType.label}
                  onChange={(e) => setNewType({ ...newType, label: e.target.value })}
                  placeholder="Ör: Şikayet"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İkon</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => setNewType({ ...newType, icon: icon.id })}
                      className={`p-2 rounded-lg border ${
                        newType.icon === icon.id 
                          ? 'bg-orange-100 border-orange-400' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                      title={icon.label}
                    >
                      {renderIcon(icon.id, 'w-4 h-4')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Renk</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(color => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setNewType({ ...newType, color: color.id })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${color.bg} ${color.text} ${
                        newType.color === color.id ? 'ring-2 ring-offset-1 ring-orange-400' : ''
                      }`}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Önizleme</label>
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${getColorClass(newType.color).bg}`}>
                  {renderIcon(newType.icon, `w-4 h-4 ${getColorClass(newType.color).text}`)}
                  <span className={`text-sm font-medium ${getColorClass(newType.color).text}`}>
                    {newType.label || 'Tür Adı'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alt Buton */}
      <button
        onClick={handleReset}
        className="w-full py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Varsayılana Dön
      </button>
    </div>
  );
}
