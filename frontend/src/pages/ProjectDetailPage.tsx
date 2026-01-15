import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { messagesApi, staffApi } from '../services/api';
import { 
  ArrowLeft, Users, Settings, Camera, Image, Send,
  Edit2, Trash2, X, Check, MessageCircle, CalendarCheck, Timer, Bell, ChevronDown
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { projects, updateProject, addProjectMessage, editProjectMessage, deleteProjectMessage } = useData();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState('');
  const [messageImage, setMessageImage] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [tempProgress, setTempProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Son görüntüleme zamanı (yeni mesaj hesaplaması için)
  const [lastViewedTime, setLastViewedTime] = useState<Date | null>(null);

  const project = projects.find(p => p.id === id);

  // Project progress değiştiğinde displayProgress'i güncelle
  useEffect(() => {
    if (project) {
      setDisplayProgress(project.progress || 0);
    }
  }, [project?.progress]);

  // Son görüntüleme zamanını yükle
  useEffect(() => {
    if (!id) return;
    const savedLastViewed = localStorage.getItem('project_last_viewed');
    if (savedLastViewed) {
      const parsed = JSON.parse(savedLastViewed);
      if (parsed[id]) {
        setLastViewedTime(new Date(parsed[id]));
      }
    }
  }, [id]);

  // Staff listesini yükle
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const staff = await staffApi.getAll();
        setStaffList(staff);
      } catch (err) {
        console.error('Staff yüklenemedi:', err);
      }
    };
    loadStaff();
  }, []);

  // Mesajları canlı takip et (her 3 saniyede güncelle)
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  
  useEffect(() => {
    if (!id) return;
    
    // İlk yükleme
    const loadMessages = async () => {
      try {
        const messages = await messagesApi.getByProject(id);
        setLiveMessages(messages);
      } catch (err) {
        console.error('Mesajlar yüklenemedi:', err);
      }
    };
    
    loadMessages();
    
    // Her 3 saniyede güncelle
    const interval = setInterval(loadMessages, 3000);
    
    return () => clearInterval(interval);
  }, [id]);

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

  // Tarih hesaplamaları
  const startDate = new Date(project.startDate || project.createdAt);
  const endDate = project.endDate ? new Date(project.endDate) : null;
  const now = new Date();
  
  // Başlayalı geçen süre
  const elapsedMs = now.getTime() - startDate.getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  const elapsedWeeks = Math.floor(elapsedDays / 7);
  const elapsedYears = Math.floor(elapsedDays / 365);
  
  // Bitmesine kalan süre
  let remainingDays = 0;
  let remainingWeeks = 0;
  let remainingYears = 0;
  let isOverdue = false;
  
  if (endDate) {
    const remainingMs = endDate.getTime() - now.getTime();
    if (remainingMs < 0) {
      isOverdue = true;
      remainingDays = Math.abs(Math.floor(remainingMs / (1000 * 60 * 60 * 24)));
    } else {
      remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    }
    remainingWeeks = Math.floor(remainingDays / 7);
    remainingYears = Math.floor(remainingDays / 365);
  }

  // Mesaj sayıları
  const totalMessages = liveMessages.length;
  const newMessages = lastViewedTime 
    ? liveMessages.filter(msg => new Date(msg.createdAt) > lastViewedTime).length 
    : totalMessages;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dusunuluyor': return 'bg-cyan-100 text-cyan-700';
      case 'planlandi': return 'bg-purple-100 text-purple-700';
      case 'devam_ediyor': return 'bg-blue-100 text-blue-700';
      case 'tamamlandi': return 'bg-green-100 text-green-700';
      case 'beklemede': return 'bg-yellow-100 text-yellow-700';
      case 'iptal': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'dusunuluyor': return 'Düşünülüyor';
      case 'planlandi': return 'Planlandı';
      case 'devam_ediyor': return 'Devam Ediyor';
      case 'tamamlandi': return 'Tamamlandı';
      case 'beklemede': return 'Beklemede';
      case 'iptal': return 'İptal';
      default: return status;
    }
  };

  const statusOptions = [
    { value: 'dusunuluyor', label: 'Düşünülüyor', color: 'bg-cyan-100 text-cyan-700' },
    { value: 'planlandi', label: 'Planlandı', color: 'bg-purple-100 text-purple-700' },
    { value: 'devam_ediyor', label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-700' },
    { value: 'tamamlandi', label: 'Tamamlandı', color: 'bg-green-100 text-green-700' },
    { value: 'beklemede', label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'iptal', label: 'İptal', color: 'bg-red-100 text-red-700' },
  ];

  const handleStatusChange = async (newStatus: string) => {
    setShowStatusDropdown(false);
    await updateProject(project.id, { status: newStatus });
  };

  // Görüntüleyenlerin isimlerini al
  const getViewerNames = () => {
    if (!project.visibleTo || project.visibleTo.length === 0) return [];
    return project.visibleTo.map((id: string) => {
      const staff = staffList.find(s => s.id === id);
      return staff?.name || `Kullanıcı ${id}`;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMessageImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!user || (!message.trim() && !messageImage)) return;
    
    const msgText = message;
    const msgImage = messageImage;
    
    // Input'ları hemen temizle
    setMessage('');
    setMessageImage(null);
    
    // Anında göster (optimistic update)
    const tempMessage = {
      id: `temp-${Date.now()}`,
      projectId: project.id,
      userId: user.id,
      userName: user.name,
      message: msgText,
      image: msgImage,
      createdAt: new Date().toISOString(),
    };
    setLiveMessages(prev => [...prev, tempMessage]);
    
    // Mesajı API'ye gönder
    await addProjectMessage(project.id, msgText, user.id, user.name, msgImage || undefined);
    
    // Mesajları yenile (gerçek ID'leri almak için)
    try {
      const messages = await messagesApi.getByProject(project.id);
      setLiveMessages(messages);
    } catch (err) {
      console.error('Mesajlar yüklenemedi:', err);
    }
  };

  const handleProgressUpdate = async () => {
    // Önce UI'ı hemen güncelle
    setDisplayProgress(tempProgress);
    setShowProgressModal(false);
    
    // Sonra backend'e kaydet
    await updateProject(project.id, { progress: tempProgress });
  };

  const openProgressModal = () => {
    setTempProgress(displayProgress);
    setShowProgressModal(true);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20 sm:pb-24">
      {/* Header */}
      <div className="bg-white border-b px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate('/projects')} className="p-1">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
          {/* Durum Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 ${getStatusColor(project.status)}`}
            >
              {getStatusText(project.status)}
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            {showStatusDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-30 min-w-[140px]">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusChange(opt.value)}
                      className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        project.status === opt.value ? 'bg-gray-50' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${opt.color.replace('text-', 'bg-').split(' ')[0]}`} />
                      {opt.label}
                      {project.status === opt.value && <Check className="w-3 h-3 ml-auto text-green-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <button 
          onClick={() => navigate(`/projects/${id}/edit`)}
          className="text-blue-600 font-medium text-sm sm:text-base px-2 sm:px-3 py-1 hover:bg-blue-50 rounded-lg"
        >
          Düzenle
        </button>
      </div>

      <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 max-w-2xl mx-auto">
        {/* Başlık */}
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{project.title}</h1>
        
        {/* Açıklama */}
        {project.description && (
          <p className="text-sm sm:text-base text-gray-600">{project.description}</p>
        )}

        {/* Etiketler */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tagId: string) => {
              const tag = getTagById(tagId);
              if (!tag) return null;
              return (
                <span
                  key={tagId}
                  className={`text-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 ${tag.color}`}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Görüntüleyen Kişiler - Kompakt */}
        {getViewerNames().length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-[10px] text-gray-400 mr-1">👥</span>
            {getViewerNames().map((name: string, idx: number) => (
              <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">
                {name}
              </span>
            ))}
          </div>
        )}

        {/* Süre ve Mesaj Bilgileri - Ultra Kompakt */}
        <div className="grid grid-cols-4 gap-1.5">
          {/* Başlayalı */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2 text-white text-center">
            <Timer className="w-3 h-3 mx-auto mb-0.5 opacity-80" />
            <div className="text-sm font-bold">{elapsedDays}</div>
            <div className="text-[8px] opacity-70">Gün</div>
          </div>

          {/* Bitiş */}
          <div className={`rounded-lg p-2 text-white text-center ${
            endDate 
              ? isOverdue ? 'bg-gradient-to-br from-red-500 to-rose-600' : 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-gray-400 to-gray-500'
          }`}>
            <CalendarCheck className="w-3 h-3 mx-auto mb-0.5 opacity-80" />
            <div className="text-sm font-bold">{endDate ? remainingDays : '-'}</div>
            <div className="text-[8px] opacity-70">{endDate ? (isOverdue ? 'Gecikti' : 'Kalan') : 'Bitiş'}</div>
          </div>

          {/* Mesajlar */}
          <div className="bg-white rounded-lg p-2 shadow-sm text-center border-l-2 border-blue-500">
            <MessageCircle className="w-3 h-3 mx-auto mb-0.5 text-blue-500" />
            <div className="text-sm font-bold text-gray-800">{totalMessages}</div>
            <div className="text-[8px] text-gray-400">{newMessages > 0 ? <span className="text-red-500">+{newMessages}</span> : 'Mesaj'}</div>
          </div>

          {/* Görüntüleyen */}
          <div className="bg-white rounded-lg p-2 shadow-sm text-center border-l-2 border-purple-500">
            <Users className="w-3 h-3 mx-auto mb-0.5 text-purple-500" />
            <div className="text-sm font-bold text-gray-800">{project.visibleTo?.length || 0}</div>
            <div className="text-[8px] text-gray-400">Kişi</div>
          </div>
        </div>

        {/* Mahalle - Ayrı satırda */}
        {project.mahalle && (
          <div className="flex items-center justify-center gap-1 text-xs text-orange-600 font-medium">
            <span>📍</span> {project.mahalle}
          </div>
        )}

        {/* Tamamlanma - Ultra Kompakt */}
        <button 
          onClick={openProgressModal}
          className="w-full bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Tamamlanma</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
            <span className="text-blue-600 font-bold text-sm">%{displayProgress}</span>
          </div>
        </button>

        {/* Mesajlar / Durum Güncellemeleri */}
        <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span className="font-medium text-gray-700 text-sm sm:text-base">Mesajlar / Durum Güncellemeleri</span>
            </div>
            {totalMessages > 0 && (
              <span className="text-xs sm:text-sm text-gray-400">{totalMessages} mesaj</span>
            )}
          </div>

          {liveMessages && liveMessages.length > 0 ? (
            <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
              {liveMessages.map((msg) => (
                <div key={msg.id} className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-start sm:items-center justify-between mb-1 flex-wrap gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-xs sm:text-sm">{msg.userName}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(msg.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    {/* Düzenle/Sil butonları - sadece kendi mesajı için */}
                    {user && msg.userId === user.id && editingMessageId !== msg.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditingMessageText(msg.message);
                          }}
                          className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Mesajı silmek istediğinize emin misiniz?')) {
                              await deleteProjectMessage(project.id, msg.id);
                              // Hemen güncelle
                              const messages = await messagesApi.getByProject(project.id);
                              setLiveMessages(messages);
                            }
                          }}
                          className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Düzenleme modu */}
                  {editingMessageId === msg.id ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={editingMessageText}
                        onChange={(e) => setEditingMessageText(e.target.value)}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        autoFocus
                      />
                      <button
                        onClick={async () => {
                          await editProjectMessage(project.id, msg.id, editingMessageText);
                          setEditingMessageId(null);
                          setEditingMessageText('');
                          // Hemen güncelle
                          const messages = await messagesApi.getByProject(project.id);
                          setLiveMessages(messages);
                        }}
                        className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Kaydet"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingMessageId(null);
                          setEditingMessageText('');
                        }}
                        className="p-1.5 sm:p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                        title="İptal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-600">{msg.message}</p>
                  )}
                  
                  {msg.image && (
                    <img src={msg.image} alt="" className="mt-2 rounded-lg max-h-32 sm:max-h-40 md:max-h-48 object-cover" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-6 sm:py-8 text-sm">Henüz mesaj yok</p>
          )}
        </div>
      </div>

      {/* Message Input - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 sm:p-3 md:p-4 safe-area-bottom">
        <div className="max-w-2xl mx-auto">
          {messageImage && (
            <div className="mb-2 relative inline-block">
              <img src={messageImage} alt="" className="h-12 sm:h-16 rounded-lg" />
              <button 
                onClick={() => setMessageImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          )}
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex-shrink-0"
            >
              <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg flex-shrink-0 hidden sm:block"
            >
              <Image className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mesaj yaz..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-full text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!message.trim() && !messageImage}
              className="p-1.5 sm:p-2 text-blue-600 disabled:text-gray-300 hover:bg-blue-50 rounded-lg flex-shrink-0"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Update Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">İlerleme Güncelle</h3>
            
            {/* Mevcut değer */}
            <div className="text-center mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl font-bold text-blue-600">%{tempProgress}</span>
            </div>

            {/* Hızlı seçim butonları - %2'şer artış */}
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 mb-3 sm:mb-4 max-h-32 sm:max-h-40 overflow-y-auto">
              {Array.from({ length: 51 }, (_, i) => i * 2).map((value) => (
                <button
                  key={value}
                  onClick={() => setTempProgress(value)}
                  className={`py-1.5 sm:py-2 rounded text-xs font-medium transition-colors ${
                    tempProgress === value 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            
            {/* Slider */}
            <div className="mb-4 sm:mb-6">
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={tempProgress}
                onChange={(e) => setTempProgress(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowProgressModal(false)}
                className="flex-1 py-2.5 sm:py-3 text-gray-600 border border-gray-300 rounded-lg font-medium text-sm sm:text-base"
              >
                İptal
              </button>
              <button
                onClick={handleProgressUpdate}
                className="flex-1 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm sm:text-base"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
