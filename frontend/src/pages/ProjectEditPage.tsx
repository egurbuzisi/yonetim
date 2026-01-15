import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Camera, Image, Save, X, Check, Trash2, Tag, Search } from 'lucide-react';
import { YILDIRIM_MAHALLELERI } from '../constants/mahalleler';
import { PROJECT_TAGS } from '../constants/projectTags';
import { staffApi } from '../services/api';

export default function ProjectEditPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { projects, updateProject, deleteProject } = useData();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const project = projects.find(p => p.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mahalle, setMahalle] = useState('');
  const [adaParsel, setAdaParsel] = useState('');
  const [firma, setFirma] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [status, setStatus] = useState('beklemede');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Staff listesini yükle
  useEffect(() => {
    staffApi.getAll()
      .then(data => setStaffList(data))
      .catch(err => console.error('Staff yüklenemedi:', err));
  }, []);

  // Filtrelenmiş staff listesi
  const filteredStaff = staffList.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setDescription(project.description || '');
      setMahalle(project.mahalle || '');
      setAdaParsel(project.adaParsel || '');
      setFirma(project.firma || '');
      setPhotos(project.photos || []);
      setStatus(project.status || 'beklemede');
      setStartDate(project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '');
      setEndDate(project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '');
      setBudget(project.budget?.toString() || '');
      setResponsiblePerson(project.responsiblePerson || '');
      setSelectedUsers(project.visibleTo || []);
      setSelectedTags(project.tags || []);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Proje bulunamadı</p>
        <button onClick={() => navigate('/projects')} className="mt-4 text-blue-600">
          Projelere dön
        </button>
      </div>
    );
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setPhotos(prev => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title) return;

    await updateProject(project.id, {
      title,
      description,
      mahalle,
      adaParsel,
      firma,
      photos,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      budget: budget ? parseFloat(budget) : undefined,
      responsiblePerson,
      visibleTo: selectedUsers.length > 0 ? selectedUsers : [user.id],
      tags: selectedTags,
    });

    navigate(`/projects/${id}`);
  };

  const handleDelete = async () => {
    await deleteProject(project.id);
    navigate('/projects');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Proje Düzenle</h1>
        <button onClick={handleSubmit} className="p-1">
          <Save className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Proje Adı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proje Adı <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Proje adını girin..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            required
          />
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Proje açıklaması..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            rows={3}
          />
        </div>

        {/* Etiketler */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Proje Etiketi
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_TAGS.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedTags.includes(tag.id)
                    ? `${tag.color} ring-2 ring-offset-1 ring-blue-400`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{tag.icon}</span>
                <span>{tag.label}</span>
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {selectedTags.length} etiket seçildi
            </p>
          )}
        </div>

        {/* Mahalle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">📍 Mahalle</label>
          <select
            value={mahalle}
            onChange={(e) => setMahalle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
          >
            <option value="">Mahalle Seçin...</option>
            {YILDIRIM_MAHALLELERI.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Ada / Parsel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ada / Parsel</label>
          <input
            type="text"
            value={adaParsel}
            onChange={(e) => setAdaParsel(e.target.value)}
            placeholder="Örn: 1234 Ada / 56 Parsel"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>

        {/* İşi Yapan Firma */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İşi Yapan Firma</label>
          <input
            type="text"
            value={firma}
            onChange={(e) => setFirma(e.target.value)}
            placeholder="Firma adı..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>

        {/* Fotoğraflar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fotoğraflar</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
            >
              <Camera className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Çek</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
            >
              <Image className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500 mt-1">Galeri</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
          {photos.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img src={photo} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Durum */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
          >
            <option value="dusunuluyor">Düşünülüyor</option>
            <option value="planlandi">Planlandı</option>
            <option value="devam_ediyor">Devam Ediyor</option>
            <option value="tamamlandi">Tamamlandı</option>
            <option value="beklemede">Beklemede</option>
            <option value="iptal">İptal</option>
          </select>
        </div>

        {/* Başlangıç Tarihi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>

        {/* Hedef Bitiş Tarihi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Bitiş Tarihi</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>

        {/* Bütçe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bütçe (₺)</label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>

        {/* Sorumlu Kişi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sorumlu Kişi</label>
          <input
            type="text"
            value={responsiblePerson}
            onChange={(e) => setResponsiblePerson(e.target.value)}
            placeholder="Sorumlu kişi adı..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>

        {/* Kimler Görebilsin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kimler Görebilsin?</label>
          <div 
            onClick={() => setShowUserSelector(true)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white flex justify-between items-center cursor-pointer"
          >
            <span className="text-gray-600">
              {selectedUsers.length > 0 ? `${selectedUsers.length} kişi seçili` : 'Seçim yapılmadı'}
            </span>
            <span className="text-blue-600 text-sm">Düzenle</span>
          </div>
        </div>

        {/* Kaydet Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Değişiklikleri Kaydet
        </button>

        {/* Sil Button */}
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full bg-red-50 text-red-600 py-4 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Projeyi Sil
        </button>
      </form>

      {/* User Selector Modal */}
      {showUserSelector && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-blue-50">
              <h3 className="font-semibold text-blue-800">Kişi Seç</h3>
              <button onClick={() => { setShowUserSelector(false); setSearchTerm(''); }}>
                <X className="w-6 h-6 text-blue-600" />
              </button>
            </div>
            {/* Arama */}
            <div className="p-3 border-b bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Kişi ara..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-[50vh]">
              {filteredStaff.length > 0 ? (
                filteredStaff.map(u => (
                  <div
                    key={u.id}
                    onClick={() => toggleUserSelection(u.id)}
                    className={`flex items-center justify-between p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedUsers.includes(u.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{u.name}</p>
                      {u.title && <p className="text-sm text-gray-500">{u.title}</p>}
                    </div>
                    {selectedUsers.includes(u.id) && (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">Kişi bulunamadı</p>
              )}
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => { setShowUserSelector(false); setSearchTerm(''); }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
              >
                Tamam ({selectedUsers.length} kişi seçili)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Projeyi Sil</h3>
            <p className="text-gray-600 mb-4">
              Bu projeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
