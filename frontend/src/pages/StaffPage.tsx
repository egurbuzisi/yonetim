import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Plus, Edit2, Trash2, X, User, Phone, Briefcase, Save, RotateCcw, Users, UserCheck, Shield, Key, UserX, Eye, EyeOff } from 'lucide-react';
import { staffApi } from '../services/api';

// Rol seçenekleri
const ROLE_OPTIONS = [
  { id: 'baskan', label: 'Başkan', color: 'bg-red-100 text-red-700', icon: Shield },
  { id: 'baskan_yrd', label: 'Başkan Yardımcısı', color: 'bg-purple-100 text-purple-700', icon: Shield },
  { id: 'ozel_kalem', label: 'Özel Kalem', color: 'bg-orange-100 text-orange-700', icon: UserCheck },
  { id: 'mudur', label: 'Müdür', color: 'bg-blue-100 text-blue-700', icon: Briefcase },
  { id: 'meclis_uyesi', label: 'Meclis Üyesi', color: 'bg-green-100 text-green-700', icon: Users },
  { id: 'personel', label: 'Personel', color: 'bg-gray-100 text-gray-700', icon: User },
];

interface Staff {
  id: string;
  name: string;
  role: string;
  title: string;
  phone?: string;
  active: boolean;
  isUser?: boolean;
  password?: string;
  party?: string;
}

// Parti renkleri
const PARTY_COLORS: Record<string, string> = {
  'AK Parti': 'bg-orange-100 text-orange-700',
  'MHP': 'bg-red-100 text-red-700',
  'CHP': 'bg-red-100 text-red-700',
  'BBP': 'bg-yellow-100 text-yellow-700',
};

export default function StaffPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterParty, setFilterParty] = useState<string>('all');
  const [newStaff, setNewStaff] = useState({ name: '', role: 'mudur', title: '', phone: '' });
  
  // Kullanıcı yapma modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedStaffForUser, setSelectedStaffForUser] = useState<Staff | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Admin kontrolü (sadece başkan ve özel kalem)
  const isAdmin = user?.role === 'baskan' || user?.role === 'ozel_kalem';

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const data = await staffApi.getAll();
      setStaff(data.filter((s: Staff) => s.active));
    } catch (error) {
      console.error('Görevliler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newStaff.name.trim()) {
      alert('Ad soyad gerekli!');
      return;
    }
    
    try {
      const created = await staffApi.create({
        ...newStaff,
        title: newStaff.title || getRoleLabel(newStaff.role)
      });
      setStaff([...staff, created]);
      setNewStaff({ name: '', role: 'mudur', title: '', phone: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Görevli eklenirken hata:', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingStaff) return;
    
    try {
      await staffApi.update(editingStaff.id, editingStaff);
      setStaff(staff.map(s => s.id === editingStaff.id ? editingStaff : s));
      setEditingStaff(null);
    } catch (error) {
      console.error('Görevli güncellenirken hata:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu görevliyi silmek istediğinize emin misiniz?')) return;
    
    try {
      await staffApi.delete(id);
      setStaff(staff.filter(s => s.id !== id));
    } catch (error) {
      console.error('Görevli silinirken hata:', error);
    }
  };

  const handleReset = async () => {
    if (!confirm('Varsayılan görevlilere dönmek istediğinize emin misiniz?')) return;
    
    try {
      const data = await staffApi.reset();
      setStaff(data.filter((s: Staff) => s.active));
    } catch (error) {
      console.error('Sıfırlanırken hata:', error);
    }
  };

  // Kullanıcı yapma modal'ını aç
  const openPasswordModal = (s: Staff) => {
    setSelectedStaffForUser(s);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setShowPasswordModal(true);
  };

  // Şifre belirle (kullanıcı yap)
  const handleSetPassword = async () => {
    if (!selectedStaffForUser) return;
    
    if (newPassword.length < 4) {
      setPasswordError('Şifre en az 4 karakter olmalı');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor');
      return;
    }
    
    try {
      await staffApi.setPassword(selectedStaffForUser.id, newPassword);
      setStaff(staff.map(s => 
        s.id === selectedStaffForUser.id ? { ...s, isUser: true } : s
      ));
      setShowPasswordModal(false);
      setSelectedStaffForUser(null);
      alert(`${selectedStaffForUser.name} artık sisteme giriş yapabilir!`);
    } catch (error) {
      console.error('Şifre belirlenirken hata:', error);
      setPasswordError('Şifre belirlenirken bir hata oluştu');
    }
  };

  // Kullanıcı yetkisini kaldır
  const handleRemoveUser = async (s: Staff) => {
    if (!confirm(`${s.name} kullanıcısının giriş yetkisini kaldırmak istiyor musunuz?`)) return;
    
    try {
      await staffApi.removeUser(s.id);
      setStaff(staff.map(st => 
        st.id === s.id ? { ...st, isUser: false } : st
      ));
    } catch (error) {
      console.error('Yetki kaldırılırken hata:', error);
    }
  };

  const getRoleLabel = (role: string) => {
    return ROLE_OPTIONS.find(r => r.id === role)?.label || role;
  };

  const getRoleColor = (role: string) => {
    return ROLE_OPTIONS.find(r => r.id === role)?.color || 'bg-gray-100 text-gray-700';
  };

  const filteredStaff = staff.filter(s => {
    if (filterRole !== 'all' && s.role !== filterRole) return false;
    if (filterRole === 'meclis_uyesi' && filterParty !== 'all' && s.party !== filterParty) return false;
    return true;
  });
  
  // Mevcut partileri al (meclis üyeleri için)
  const availableParties = [...new Set(staff.filter(s => s.role === 'meclis_uyesi' && s.party).map(s => s.party!))];

  // Role göre grupla
  const groupedStaff = {
    baskan: filteredStaff.filter(s => s.role === 'baskan'),
    baskan_yrd: filteredStaff.filter(s => s.role === 'baskan_yrd'),
    ozel_kalem: filteredStaff.filter(s => s.role === 'ozel_kalem'),
    mudur: filteredStaff.filter(s => s.role === 'mudur'),
    meclis_uyesi: filteredStaff.filter(s => s.role === 'meclis_uyesi'),
    personel: filteredStaff.filter(s => s.role === 'personel'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-4 pb-20">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
          <ArrowLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center">
          Bu sayfaya erişim yetkiniz yok. Sadece Başkan ve Özel Kalem erişebilir.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 pb-24 px-1 sm:px-0">
      {/* Header - Mobile Optimized */}
      <div className="sticky top-0 bg-gray-50 -mx-1 px-1 py-2 sm:relative sm:bg-transparent sm:py-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-gray-600 active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Geri</span>
          </button>
          <h1 className="text-base sm:text-xl font-bold text-gray-800">Görevli Yönetimi</h1>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 sm:gap-2 bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg active:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Görevli</span>
          </button>
        </div>
      </div>

      {/* Filtre - Horizontal Scroll on Mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 scrollbar-hide">
        <button
          onClick={() => setFilterRole('all')}
          className={`px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 sm:flex-shrink active:scale-95 transition-transform ${
            filterRole === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Tümü ({staff.length})
        </button>
        {ROLE_OPTIONS.map(role => {
          const count = staff.filter(s => s.role === role.id).length;
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => { setFilterRole(role.id); setFilterParty('all'); }}
              className={`flex items-center gap-1 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 sm:flex-shrink active:scale-95 transition-transform ${
                filterRole === role.id ? 'bg-orange-600 text-white' : role.color
              }`}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{role.label}</span>
              <span className="sm:hidden">{role.label.split(' ')[0]}</span>
              <span className="ml-0.5">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Parti Filtresi - Sadece Meclis Üyesi seçiliyken göster */}
      {filterRole === 'meclis_uyesi' && availableParties.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 scrollbar-hide">
          <button
            onClick={() => setFilterParty('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 active:scale-95 transition-transform ${
              filterParty === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tüm Partiler ({staff.filter(s => s.role === 'meclis_uyesi').length})
          </button>
          {availableParties.map(party => {
            const count = staff.filter(s => s.role === 'meclis_uyesi' && s.party === party).length;
            return (
              <button
                key={party}
                onClick={() => setFilterParty(party)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 active:scale-95 transition-transform ${
                  filterParty === party ? 'bg-green-600 text-white' : PARTY_COLORS[party] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {party} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Görevli Listesi */}
      {filterRole === 'all' ? (
        // Gruplu görünüm
        <div className="space-y-6">
          {Object.entries(groupedStaff).map(([role, members]) => {
            if (members.length === 0) return null;
            const roleInfo = ROLE_OPTIONS.find(r => r.id === role);
            const Icon = roleInfo?.icon || User;
            return (
              <div key={role}>
                <h2 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {roleInfo?.label || role} ({members.length})
                </h2>
                <div className="space-y-2">
                  {members.map(s => renderStaffCard(s))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Filtrelenmiş liste
        <div className="space-y-2">
          {filteredStaff.map(s => renderStaffCard(s))}
        </div>
      )}

      {filteredStaff.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Görevli bulunamadı</p>
        </div>
      )}

      {/* Yeni Görevli Modal - Mobile Bottom Sheet */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base sm:text-lg">Yeni Görevli</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 -mr-2 text-gray-400 active:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Ad Soyad *</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-3 py-3 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Rol</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3 py-3 sm:py-2.5 border rounded-lg bg-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Ünvan</label>
                <input
                  type="text"
                  value={newStaff.title}
                  onChange={(e) => setNewStaff({ ...newStaff, title: e.target.value })}
                  placeholder="Fen İşleri Müdürü"
                  className="w-full px-3 py-3 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Telefon</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="0532 123 45 67"
                  className="w-full px-3 py-3 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 sm:py-2.5 text-gray-600 bg-gray-100 rounded-xl sm:rounded-lg active:bg-gray-200 transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 py-3 sm:py-2.5 bg-orange-600 text-white rounded-xl sm:rounded-lg active:bg-orange-700 transition-colors font-medium"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Şifre Belirleme Modal */}
      {showPasswordModal && selectedStaffForUser && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base sm:text-lg">Kullanıcı Yap</h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 -mr-2 text-gray-400 active:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-green-50 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-green-800">{selectedStaffForUser.name}</p>
              <p className="text-xs text-green-600">{selectedStaffForUser.title}</p>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Bu kişi için bir şifre belirleyin. Şifre ile sisteme giriş yapabilecek.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Şifre *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                    placeholder="En az 4 karakter"
                    className="w-full px-3 py-3 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Şifre Tekrar *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                  placeholder="Şifreyi tekrar girin"
                  className="w-full px-3 py-3 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-3 sm:py-2.5 text-gray-600 bg-gray-100 rounded-xl sm:rounded-lg active:bg-gray-200 transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  onClick={handleSetPassword}
                  className="flex-1 py-3 sm:py-2.5 bg-green-600 text-white rounded-xl sm:rounded-lg active:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Kullanıcı Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alt Buton */}
      <button
        onClick={handleReset}
        className="w-full py-3.5 sm:py-3 text-gray-600 bg-gray-100 rounded-xl active:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <RotateCcw className="w-4 h-4" />
        Varsayılana Dön
      </button>
    </div>
  );

  function renderStaffCard(s: Staff) {
    const isEditing = editingStaff?.id === s.id;

    if (isEditing) {
      return (
        <div key={s.id} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border-2 border-orange-400">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ad Soyad *</label>
              <input
                type="text"
                value={editingStaff.name}
                onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Rol</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  className="w-full px-2 sm:px-3 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Telefon</label>
                <input
                  type="tel"
                  value={editingStaff.phone || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ünvan</label>
              <input
                type="text"
                value={editingStaff.title}
                onChange={(e) => setEditingStaff({ ...editingStaff, title: e.target.value })}
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditingStaff(null)}
                className="flex-1 sm:flex-none px-4 py-2.5 text-gray-600 bg-gray-100 active:bg-gray-200 rounded-lg text-sm font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-orange-600 text-white rounded-lg active:bg-orange-700 flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div key={s.id} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm active:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getRoleColor(s.role)}`}>
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{s.name}</p>
                {s.party && (
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full flex-shrink-0 ${PARTY_COLORS[s.party] || 'bg-gray-100 text-gray-600'}`}>
                    {s.party}
                  </span>
                )}
                {s.isUser && (
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full flex-shrink-0">
                    Kullanıcı
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-gray-500 truncate">{s.title}</p>
              {s.phone && (
                <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{s.phone}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-0.5 sm:gap-1 flex-shrink-0 ml-2">
            {/* Kullanıcı Yap / Kaldır Butonu */}
            {s.isUser ? (
              <button
                onClick={() => handleRemoveUser(s)}
                className="p-2.5 sm:p-2 text-orange-500 active:bg-orange-50 rounded-lg transition-colors"
                title="Kullanıcı yetkisini kaldır"
              >
                <UserX className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => openPasswordModal(s)}
                className="p-2.5 sm:p-2 text-green-500 active:bg-green-50 rounded-lg transition-colors"
                title="Kullanıcı yap"
              >
                <Key className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setEditingStaff(s)}
              className="p-2.5 sm:p-2 text-blue-500 active:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(s.id)}
              className="p-2.5 sm:p-2 text-red-500 active:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}
