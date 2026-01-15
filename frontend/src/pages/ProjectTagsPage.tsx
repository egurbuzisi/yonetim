import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectTagsApi } from '../services/api';
import { ArrowLeft, Plus, Edit2, Trash2, X, Check, Tag } from 'lucide-react';

interface ProjectTag {
  id: string;
  label: string;
  color: string;
}

const COLOR_OPTIONS = [
  { value: 'bg-blue-100 text-blue-700', label: 'Mavi', preview: 'bg-blue-500' },
  { value: 'bg-purple-100 text-purple-700', label: 'Mor', preview: 'bg-purple-500' },
  { value: 'bg-amber-100 text-amber-700', label: 'Amber', preview: 'bg-amber-500' },
  { value: 'bg-orange-100 text-orange-700', label: 'Turuncu', preview: 'bg-orange-500' },
  { value: 'bg-green-100 text-green-700', label: 'Yeşil', preview: 'bg-green-500' },
  { value: 'bg-emerald-100 text-emerald-700', label: 'Zümrüt', preview: 'bg-emerald-500' },
  { value: 'bg-pink-100 text-pink-700', label: 'Pembe', preview: 'bg-pink-500' },
  { value: 'bg-indigo-100 text-indigo-700', label: 'İndigo', preview: 'bg-indigo-500' },
  { value: 'bg-cyan-100 text-cyan-700', label: 'Camgöbeği', preview: 'bg-cyan-500' },
  { value: 'bg-rose-100 text-rose-700', label: 'Gül', preview: 'bg-rose-500' },
  { value: 'bg-teal-100 text-teal-700', label: 'Deniz', preview: 'bg-teal-500' },
  { value: 'bg-violet-100 text-violet-700', label: 'Menekşe', preview: 'bg-violet-500' },
  { value: 'bg-lime-100 text-lime-700', label: 'Limon', preview: 'bg-lime-500' },
  { value: 'bg-fuchsia-100 text-fuchsia-700', label: 'Fuşya', preview: 'bg-fuchsia-500' },
  { value: 'bg-sky-100 text-sky-700', label: 'Gök', preview: 'bg-sky-500' },
  { value: 'bg-gray-100 text-gray-700', label: 'Gri', preview: 'bg-gray-500' },
];

export default function ProjectTagsPage() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<ProjectTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Yeni etiket
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0].value);
  
  // Düzenleme
  const [editingTag, setEditingTag] = useState<ProjectTag | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('');

  // Etiketleri yükle
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const data = await projectTagsApi.getAll();
      setTags(data);
    } catch (err) {
      setError('Etiketler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Yeni etiket ekle
  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    
    try {
      const newTag = await projectTagsApi.create({ label: newLabel.trim(), color: newColor });
      setTags([...tags, newTag]);
      setShowAddModal(false);
      setNewLabel('');
      setNewColor(COLOR_OPTIONS[0].value);
    } catch (err: any) {
      setError(err.message || 'Etiket eklenemedi');
    }
  };

  // Etiket güncelle
  const handleUpdate = async () => {
    if (!editingTag || !editLabel.trim()) return;
    
    try {
      const updated = await projectTagsApi.update(editingTag.id, { label: editLabel.trim(), color: editColor });
      setTags(tags.map(t => t.id === editingTag.id ? updated : t));
      setEditingTag(null);
    } catch (err: any) {
      setError(err.message || 'Etiket güncellenemedi');
    }
  };

  // Etiket sil
  const handleDelete = async (id: string) => {
    if (!confirm('Bu etiketi silmek istediğinize emin misiniz?')) return;
    
    try {
      await projectTagsApi.delete(id);
      setTags(tags.filter(t => t.id !== id));
    } catch (err) {
      setError('Etiket silinemedi');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Proje Etiketleri</h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" />
          Yeni Etiket
        </button>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-3">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center justify-between">
            {error}
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {tags.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Henüz etiket yok</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-indigo-600 font-medium hover:underline"
            >
              İlk etiketi ekle
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl divide-y">
            {tags.map((tag) => (
              <div key={tag.id} className="p-3 flex items-center justify-between">
                {editingTag?.id === tag.id ? (
                  // Düzenleme modu
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
                      autoFocus
                    />
                    <select
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="px-2 py-1.5 border rounded-lg text-sm"
                    >
                      {COLOR_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleUpdate}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingTag(null)}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  // Normal görünüm
                  <>
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tag.color}`}>
                      {tag.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingTag(tag);
                          setEditLabel(tag.label);
                          setEditColor(tag.color);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">
          Toplam {tags.length} etiket
        </p>
      </div>

      {/* Yeni Etiket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Yeni Etiket Ekle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Etiket Adı</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Örn: Kentsel Dönüşüm"
                  className="w-full px-3 py-2 border rounded-lg"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Renk</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setNewColor(opt.value)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all ${opt.value} ${
                        newColor === opt.value ? 'ring-2 ring-offset-1 ring-indigo-500' : ''
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <label className="block text-sm text-gray-600 mb-1">Önizleme</label>
                <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium ${newColor}`}>
                  {newLabel || 'Etiket Adı'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewLabel('');
                }}
                className="flex-1 py-2 text-gray-600 border rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={handleAdd}
                disabled={!newLabel.trim()}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
