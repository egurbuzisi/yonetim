import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User, Mail, Phone, Building, Settings, ChevronRight, Tag, Users, UserCheck } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Admin kontrolü (sadece başkan ve özel kalem)
  const isAdmin = user?.role === 'baskan' || user?.role === 'ozel_kalem';

  return (
    <div className="space-y-4 pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600">
        <ArrowLeft className="w-5 h-5" />
        <span>Geri</span>
      </button>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full" />
          ) : (
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-indigo-600" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800">{user?.name}</h1>
            <p className="text-gray-500">{user?.department}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">{user?.phone || 'Telefon belirtilmemiş'}</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Building className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">{user?.department}</span>
          </div>
        </div>
      </div>

      {/* Ayarlar */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            Ayarlar
          </h2>
        </div>
        
        <button
          onClick={() => navigate('/settings/task-types')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Kayıt Türleri</p>
              <p className="text-xs text-gray-500">Talep, Düğün, Randevu vb. türleri yönet</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => navigate('/settings/contacts')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Kişiler</p>
              <p className="text-xs text-gray-500">Talep eden kişileri yönet</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {/* Görevli Yönetimi - Sadece admin için */}
        {isAdmin && (
          <button
            onClick={() => navigate('/settings/staff')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-800">Görevli Yönetimi</p>
                <p className="text-xs text-gray-500">Müdürler, Başkan Yardımcıları, Meclis Üyeleri</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
