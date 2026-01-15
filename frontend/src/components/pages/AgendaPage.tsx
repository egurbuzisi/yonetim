import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Plus, ChevronRight, User, Users, Clock, Calendar, MessageCircle, ClipboardList } from 'lucide-react';
import { staffApi } from '../../services/api';

export default function AgendaPage() {
  const { user } = useAuth();
  const { getFilteredAgendas, addPendingTask } = useData();
  const navigate = useNavigate();
  
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAgenda, setSelectedAgenda] = useState<any>(null);
  const [transferring, setTransferring] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Staff listesini yükle
  useEffect(() => {
    staffApi.getAll()
      .then(data => setStaffList(data))
      .catch(err => console.error('Staff yüklenemedi:', err));
  }, []);

  const agendas = user ? getFilteredAgendas(user.id, user.role) : [];

  // Kullanıcı adını ID'den bul
  const getUserName = (userId: string) => {
    const foundUser = staffList.find(u => u.id === userId);
    return foundUser?.name || 'Bilinmeyen';
  };

  // Kaç gün geçtiğini hesapla
  const getDaysAgo = (date: Date) => {
    const now = new Date();
    const created = new Date(date);
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    return `${diffDays} gün önce`;
  };

  // Durum rengini belirle
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'bekliyor': return 'bg-yellow-100 text-yellow-700';
      case 'gorusuldu': return 'bg-blue-100 text-blue-700';
      case 'ertelendi': return 'bg-orange-100 text-orange-700';
      case 'iptal': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'bekliyor': return 'Bekliyor';
      case 'gorusuldu': return 'Görüşüldü';
      case 'ertelendi': return 'Ertelendi';
      case 'iptal': return 'İptal';
      default: return status;
    }
  };

  // Öncelik rengini belirle
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'acil': return 'bg-red-500';
      case 'yuksek': return 'bg-orange-500';
      case 'orta': return 'bg-blue-500';
      case 'dusuk': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Bekleyen'e aktar butonuna tıklama
  const handleTransferClick = (e: React.MouseEvent, agenda: any) => {
    e.stopPropagation(); // Kartın tıklanmasını engelle
    setSelectedAgenda(agenda);
    setShowTransferModal(true);
  };

  // Bekleyen'e Aktar
  const handleTransferToPending = async (pendingType: string) => {
    if (!user || !selectedAgenda) return;
    
    setTransferring(true);
    try {
      await addPendingTask({
        title: selectedAgenda.title,
        description: selectedAgenda.description || '',
        type: pendingType,
        status: 'beklemede',
        priority: selectedAgenda.priority || 'orta',
        requesterName: selectedAgenda.relatedToName || '',
        requesterPhone: '',
        location: selectedAgenda.mahalle || '',
        createdBy: user.id,
        assignedTo: [user.id],
        visibleTo: selectedAgenda.visibleTo || [user.id],
      });
      
      setShowTransferModal(false);
      setSelectedAgenda(null);
      alert('Gündem başarıyla Bekleyen\'e aktarıldı!');
    } catch (error) {
      console.error('Aktarma hatası:', error);
      alert('Aktarma sırasında bir hata oluştu.');
    } finally {
      setTransferring(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Gündem</h1>
        <button
          onClick={() => navigate('/agenda/new')}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni</span>
        </button>
      </div>

      {agendas.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">Henüz gündem bulunmuyor</p>
          <button
            onClick={() => navigate('/agenda/new')}
            className="mt-4 text-green-600 font-medium hover:underline"
          >
            İlk gündemi oluştur
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {agendas.map((agenda) => (
            <div
              key={agenda.id}
              onClick={() => navigate(`/agenda/${agenda.id}`)}
              className="w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Başlık ve Durum */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Öncelik göstergesi */}
                    <div className={`w-2 h-2 rounded-full ${getPriorityStyle(agenda.priority)}`} />
                    <h3 className="font-semibold text-gray-800">{agenda.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(agenda.status)}`}>
                      {getStatusText(agenda.status)}
                    </span>
                  </div>
                  
                  {/* Açıklama */}
                  {agenda.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{agenda.description}</p>
                  )}
                  
                  {/* Alt bilgiler */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                    {/* Kim ile ilgili */}
                    {agenda.relatedToName && (
                      <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full">
                        <span className="text-orange-600 font-medium">👤 {agenda.relatedToName}</span>
                      </div>
                    )}
                    
                    {/* Oluşturan */}
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span className="text-gray-600 font-medium">{getUserName(agenda.createdBy)}</span>
                      <span>ekledi</span>
                    </div>
                    
                    {/* Kaç gün önce */}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{getDaysAgo(agenda.createdAt)}</span>
                    </div>

                    {/* Toplantı tarihi varsa */}
                    {agenda.meetingDate && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(agenda.meetingDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Takip edenler ve Mesajlar */}
                  <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
                    {/* Takip edenler */}
                    {agenda.visibleTo && agenda.visibleTo.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-purple-500" />
                        <span className="text-gray-400">Takip:</span>
                        <span className="text-purple-600">
                          {agenda.visibleTo.slice(0, 3).map(id => getUserName(id)).join(', ')}
                          {agenda.visibleTo.length > 3 && ` +${agenda.visibleTo.length - 3}`}
                        </span>
                      </div>
                    )}
                    
                    {/* Mesaj sayısı */}
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-blue-500" />
                      <span className={`${(agenda.messages?.length || 0) > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                        {agenda.messages?.length || 0} mesaj
                      </span>
                      {(agenda.messages?.length || 0) > 0 && (
                        <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-1">
                          Yeni
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Sağ taraf - Bekleyen'e Gönder butonu */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => handleTransferClick(e, agenda)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-orange-600 text-xs font-medium"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Bekleyen'e Gönder</span>
                  </button>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bekleyen'e Aktar Modal */}
      {showTransferModal && selectedAgenda && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-md">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Bekleyen'e Aktar</h3>
            <p className="text-sm text-gray-500 mb-1">"{selectedAgenda.title}"</p>
            <p className="text-xs text-gray-400 mb-4">Hangi tür olarak aktarmak istiyorsunuz?</p>
            
            <div className="space-y-2">
              <button
                onClick={() => handleTransferToPending('talep')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <span className="text-xl">📝</span>
                <span className="font-medium text-blue-700">Talep</span>
              </button>
              
              <button
                onClick={() => handleTransferToPending('randevu')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <span className="text-xl">📅</span>
                <span className="font-medium text-green-700">Randevu</span>
              </button>
              
              <button
                onClick={() => handleTransferToPending('sikayet')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <span className="text-xl">⚠️</span>
                <span className="font-medium text-red-700">Şikayet</span>
              </button>
              
              <button
                onClick={() => handleTransferToPending('diger')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <span className="text-xl">📋</span>
                <span className="font-medium text-gray-700">Diğer</span>
              </button>
            </div>

            <button
              onClick={() => { setShowTransferModal(false); setSelectedAgenda(null); }}
              disabled={transferring}
              className="w-full mt-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg font-medium"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
