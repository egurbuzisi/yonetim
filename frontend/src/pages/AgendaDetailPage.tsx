import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { agendaMessagesApi } from '../services/api';
import { wsService } from '../services/websocket';
import { 
  ArrowLeft, Calendar, Users, Clock, Settings, Send,
  MessageCircle, CheckCircle2, PauseCircle, XCircle, ClipboardList,
  ImagePlus, Paperclip, X, FileText, Download, ChevronDown, Check
} from 'lucide-react';

export default function AgendaDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { agendas, updateAgenda, addAgendaMessage, addPendingTask } = useData();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  
  // Dosya/Fotoğraf ekleme
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Canlı mesajlar (doğrudan API'den)
  const [liveMessages, setLiveMessages] = useState<any[]>([]);

  const agenda = agendas.find(a => a.id === id);
  
  // Mesajları canlı takip et (WebSocket + polling)
  useEffect(() => {
    if (!id) return;
    
    // İlk yükleme
    const loadMessages = async () => {
      try {
        const messages = await agendaMessagesApi.getByAgenda(id);
        setLiveMessages(messages || []);
      } catch (err) {
        console.error('Mesajlar yüklenemedi:', err);
      }
    };
    
    loadMessages();
    
    // WebSocket ile gündemi izle
    wsService.watchAgenda(id);
    
    // WebSocket'ten yeni mesaj geldiğinde
    const unsubscribe = wsService.on('new_agenda_message', (data) => {
      if (data.message?.agendaId === id) {
        setLiveMessages(prev => {
          // Duplicate kontrolü
          if (prev.some(m => m.id === data.message.id)) {
            return prev;
          }
          // Temp mesaj varsa güncelle
          const withoutTemp = prev.filter(m => !m.id.startsWith('temp-'));
          return [...withoutTemp, data.message];
        });
      }
    });
    
    // Yedek olarak polling (her 5 saniyede)
    const interval = setInterval(loadMessages, 5000);
    
    return () => {
      clearInterval(interval);
      wsService.unwatchAgenda(id);
      unsubscribe();
    };
  }, [id]);
  
  // Yeni mesaj geldiğinde otomatik scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveMessages.length]);

  if (!agenda) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Gündem bulunamadı</p>
        <button onClick={() => navigate('/agenda')} className="mt-4 text-green-600">
          Gündemlere dön
        </button>
      </div>
    );
  }

  // Tarih hesaplamaları
  const createdDate = new Date(agenda.createdAt);
  const meetingDate = agenda.meetingDate ? new Date(agenda.meetingDate) : null;
  const now = new Date();
  
  // Oluşturulalı geçen süre
  const elapsedMs = now.getTime() - createdDate.getTime();
  const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
  
  // Toplantıya kalan süre
  let remainingDays = 0;
  let isPast = false;
  
  if (meetingDate) {
    const remainingMs = meetingDate.getTime() - now.getTime();
    if (remainingMs < 0) {
      isPast = true;
      remainingDays = Math.abs(Math.floor(remainingMs / (1000 * 60 * 60 * 24)));
    } else {
      remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    }
  }

  // Mesaj sayıları (canlı mesajlardan)
  const messages = liveMessages;
  const totalMessages = messages.length;

  const getStatusColor = (status: string) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'acil': return 'bg-red-100 text-red-700 border-red-300';
      case 'yuksek': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'orta': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'dusuk': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'acil': return 'Acil';
      case 'yuksek': return 'Yüksek';
      case 'orta': return 'Orta';
      case 'dusuk': return 'Düşük';
      default: return priority;
    }
  };

  const priorityOptions = [
    { value: 'acil', label: 'Acil', color: 'bg-red-100 text-red-700' },
    { value: 'yuksek', label: 'Yüksek', color: 'bg-orange-100 text-orange-700' },
    { value: 'orta', label: 'Orta', color: 'bg-blue-100 text-blue-700' },
    { value: 'dusuk', label: 'Düşük', color: 'bg-gray-100 text-gray-700' },
  ];

  const handlePriorityChange = (newPriority: string) => {
    updateAgenda(agenda.id, { priority: newPriority as any });
    setShowPriorityDropdown(false);
  };

  // Dosya seçme
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }
    
    setSelectedFile(file);
    
    // Önizleme oluştur
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };
  
  // Dosyayı kaldır
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Dosyayı base64'e çevir
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSendMessage = async () => {
    if (!user || (!message.trim() && !selectedFile)) return;
    
    let attachment = null;
    
    if (selectedFile) {
      const base64 = await fileToBase64(selectedFile);
      attachment = {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        data: base64,
      };
    }
    
    const messageText = message.trim() || '📎 Dosya eklendi';
    
    // Anında göster (optimistic update)
    const tempMessage = {
      id: `temp-${Date.now()}`,
      agendaId: agenda.id,
      userId: user.id,
      userName: user.name,
      message: messageText,
      attachment,
      createdAt: new Date().toISOString(),
    };
    setLiveMessages(prev => [...prev, tempMessage]);
    
    // API'ye gönder
    addAgendaMessage(agenda.id, messageText, user.id, user.name, attachment);
    setMessage('');
    removeFile();
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateAgenda(agenda.id, { status: newStatus as any });
    setShowStatusModal(false);
  };

  // Bekleyen'e Aktar
  const handleTransferToPending = async (pendingType: string) => {
    if (!user || !agenda) return;
    
    setTransferring(true);
    try {
      await addPendingTask({
        title: agenda.title,
        description: agenda.description || '',
        type: pendingType,
        status: 'beklemede',
        priority: agenda.priority || 'orta',
        requesterName: agenda.relatedToName || '',
        requesterPhone: '',
        location: agenda.mahalle || '',
        createdBy: user.id,
        assignedTo: [user.id],
        visibleTo: agenda.visibleTo || [user.id],
      });
      
      setShowTransferModal(false);
      // Başarılı mesajı göster ve bekleyen sayfasına yönlendir
      alert('Gündem başarıyla Bekleyen\'e aktarıldı!');
      navigate('/pending');
    } catch (error) {
      console.error('Aktarma hatası:', error);
      alert('Aktarma sırasında bir hata oluştu.');
    } finally {
      setTransferring(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20 sm:pb-24">
      {/* Header */}
      <div className="bg-white border-b px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate('/agenda')} className="p-1">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
          {/* Durum Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusModal(!showStatusModal)}
              className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 ${getStatusColor(agenda.status)}`}
            >
              {getStatusText(agenda.status)}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showStatusModal && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowStatusModal(false)} />
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-30 min-w-[120px]">
                  {[
                    { value: 'bekliyor', label: 'Bekliyor', color: 'bg-yellow-500' },
                    { value: 'gorusuldu', label: 'Görüşüldü', color: 'bg-blue-500' },
                    { value: 'ertelendi', label: 'Ertelendi', color: 'bg-orange-500' },
                    { value: 'iptal', label: 'İptal', color: 'bg-red-500' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusUpdate(opt.value)}
                      className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2 ${
                        agenda.status === opt.value ? 'bg-gray-50' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1 text-orange-600 font-medium text-xs sm:text-sm px-2 py-1 hover:bg-orange-50 rounded-lg"
            title="Bekleyen'e Aktar"
          >
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Bekleyen'e</span>
          </button>
          <button 
            onClick={() => navigate(`/agenda/${id}/edit`)}
            className="text-green-600 font-medium text-sm sm:text-base px-2 sm:px-3 py-1 hover:bg-green-50 rounded-lg"
          >
            Düzenle
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 max-w-4xl mx-auto">
        {/* Başlık ve Öncelik */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 flex-1">{agenda.title}</h1>
          {/* Öncelik Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border flex items-center gap-1 ${getPriorityColor(agenda.priority)}`}
            >
              {getPriorityText(agenda.priority)}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showPriorityDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-20" 
                  onClick={() => setShowPriorityDropdown(false)}
                />
                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-30 min-w-[120px]">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handlePriorityChange(opt.value)}
                      className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        agenda.priority === opt.value ? 'bg-gray-50' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${opt.color.split(' ')[0]}`} />
                      {opt.label}
                      {agenda.priority === opt.value && <Check className="w-3 h-3 ml-auto text-green-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Açıklama */}
        {agenda.description && (
          <p className="text-sm sm:text-base text-gray-600 bg-white rounded-xl p-4 shadow-sm">{agenda.description}</p>
        )}

        {/* Kim ile ilgili */}
        {agenda.relatedToName && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div>
              <p className="text-xs text-orange-600 font-medium">Kim ile ilgili?</p>
              <p className="text-base font-semibold text-orange-800">{agenda.relatedToName}</p>
            </div>
          </div>
        )}

        {/* Süre Bilgileri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Oluşturulma */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-2 opacity-90">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Oluşturulalı</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {elapsedDays} Gün
            </div>
            <div className="text-xs mt-2 opacity-70">
              📅 {formatDate(createdDate)}
            </div>
          </div>

          {/* Toplantı Tarihi */}
          {meetingDate ? (
            <div className={`rounded-xl p-4 text-white shadow-lg ${
              isPast 
                ? 'bg-gradient-to-br from-gray-500 to-gray-600' 
                : remainingDays <= 1 
                  ? 'bg-gradient-to-br from-red-500 to-rose-600'
                  : remainingDays <= 7
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}>
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {isPast ? 'Toplantı Geçti' : 'Toplantıya Kalan'}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1">
                {remainingDays} Gün {isPast && '⏱️'}
              </div>
              <div className="text-xs mt-2 opacity-70">
                🎯 {formatDateTime(meetingDate)}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Toplantı Tarihi</span>
              </div>
              <div className="text-xl font-bold mb-1">
                Belirlenmedi
              </div>
              <div className="text-sm opacity-80">
                Henüz toplantı tarihi eklenmedi
              </div>
            </div>
          )}
        </div>

        {/* Mesaj ve Görüntüleyen Bilgileri */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Mesaj Sayısı */}
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Mesajlar</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-800">
              {totalMessages} <span className="text-sm font-normal text-gray-500">Adet</span>
            </div>
          </div>

          {/* Görüntüleyen */}
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Görüntüleyen</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-800">
              {agenda.visibleTo?.length || 0} <span className="text-sm font-normal text-gray-500">Kişi</span>
            </div>
          </div>
        </div>

        {/* Mesajlar / Notlar */}
        <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              <span className="font-medium text-gray-700 text-sm sm:text-base">Mesajlar / Notlar</span>
            </div>
            {totalMessages > 0 && (
              <span className="text-xs sm:text-sm text-gray-400">{totalMessages} mesaj</span>
            )}
          </div>

          {messages.length > 0 ? (
            <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
              {messages.map((msg: any) => {
                const isCurrentUser = msg.userId === user?.id;
                return (
                <div key={msg.id} className={`rounded-lg p-2 sm:p-3 ${isCurrentUser ? 'bg-green-50 ml-4 sm:ml-8' : 'bg-gray-50 mr-4 sm:mr-8'}`}>
                  <div className="flex items-start gap-2 mb-1">
                    {/* Avatar */}
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${isCurrentUser ? 'bg-green-500' : 'bg-blue-500'}`}>
                      {msg.userName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-semibold text-sm ${isCurrentUser ? 'text-green-700' : 'text-blue-700'}`}>
                          {msg.userName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.createdAt).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      {msg.message && <p className="text-xs sm:text-sm text-gray-700 mt-1">{msg.message}</p>}
                  
                      {/* Ekli dosya/fotoğraf */}
                      {msg.attachment && (
                        <div className="mt-2">
                          {msg.attachment.type?.startsWith('image/') ? (
                            // Fotoğraf
                            <div className="relative inline-block">
                              <img 
                                src={msg.attachment.data} 
                                alt={msg.attachment.name}
                                className="max-w-[200px] sm:max-w-[300px] max-h-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(msg.attachment.data, '_blank')}
                              />
                              <a
                                href={msg.attachment.data}
                                download={msg.attachment.name}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          ) : (
                            // Diğer dosyalar (PDF, Word, vs.)
                            <a
                              href={msg.attachment.data}
                              download={msg.attachment.name}
                              className="flex items-center gap-2 p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors max-w-[250px]"
                            >
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700 truncate">{msg.attachment.name}</p>
                                <p className="text-[10px] text-gray-400">
                                  {(msg.attachment.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                              <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
              })}
              {/* Otomatik scroll için referans */}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <p className="text-center text-gray-400 py-6 sm:py-8 text-sm">Henüz mesaj yok</p>
          )}
        </div>
      </div>

      {/* Message Input - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 sm:p-3 md:p-4 safe-area-bottom">
        <div className="max-w-4xl mx-auto">
          {/* Seçili dosya önizlemesi */}
          {selectedFile && (
            <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center gap-2">
              {filePreview ? (
                <img src={filePreview} alt="Önizleme" className="w-12 h-12 object-cover rounded" />
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={removeFile}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Gizli file input - Galeri */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Kamera input */}
            <input
              id="cameraInput"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Kameradan Çek butonu */}
            <button
              onClick={() => {
                const cameraInput = document.getElementById('cameraInput') as HTMLInputElement;
                if (cameraInput) {
                  cameraInput.click();
                }
              }}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg flex-shrink-0"
              title="Kameradan Çek"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </button>
            
            {/* Galeriden Fotoğraf butonu */}
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = 'image/*';
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex-shrink-0"
              title="Galeriden Seç"
            >
              <ImagePlus className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            {/* Belge ekleme butonu */}
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt';
                  fileInputRef.current.click();
                }
              }}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg flex-shrink-0"
              title="Belge Ekle"
            >
              <Paperclip className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mesaj veya not yaz..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-full text-sm sm:text-base focus:ring-2 focus:ring-green-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!message.trim() && !selectedFile}
              className="p-1.5 sm:p-2 text-green-600 disabled:text-gray-300 hover:bg-green-50 rounded-lg flex-shrink-0"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-md">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Durum Güncelle</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => handleStatusUpdate('bekliyor')}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  agenda.status === 'bekliyor' ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <PauseCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">Bekliyor</span>
              </button>
              
              <button
                onClick={() => handleStatusUpdate('gorusuldu')}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  agenda.status === 'gorusuldu' ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Görüşüldü</span>
              </button>
              
              <button
                onClick={() => handleStatusUpdate('ertelendi')}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  agenda.status === 'ertelendi' ? 'bg-orange-100 border-2 border-orange-400' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Ertelendi</span>
              </button>
              
              <button
                onClick={() => handleStatusUpdate('iptal')}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  agenda.status === 'iptal' ? 'bg-red-100 border-2 border-red-400' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium">İptal</span>
              </button>
            </div>

            <button
              onClick={() => setShowStatusModal(false)}
              className="w-full mt-4 py-2.5 text-gray-600 border border-gray-300 rounded-lg font-medium"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Bekleyen'e Aktar Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl p-4 sm:p-6 w-full sm:max-w-md">
            <h3 className="text-base sm:text-lg font-semibold mb-2">Bekleyen'e Aktar</h3>
            <p className="text-sm text-gray-500 mb-4">Bu gündemi hangi tür olarak Bekleyen'e aktarmak istiyorsunuz?</p>
            
            <div className="space-y-2">
              <button
                onClick={() => handleTransferToPending('talep')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <span className="text-xl">📝</span>
                <span className="font-medium text-blue-700">Talep</span>
              </button>
              
              <button
                onClick={() => handleTransferToPending('randevu')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-green-50 hover:bg-green-100 transition-colors"
              >
                <span className="text-xl">📅</span>
                <span className="font-medium text-green-700">Randevu</span>
              </button>
              
              <button
                onClick={() => handleTransferToPending('sikayet')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <span className="text-xl">⚠️</span>
                <span className="font-medium text-red-700">Şikayet</span>
              </button>
              
              <button
                onClick={() => handleTransferToPending('diger')}
                disabled={transferring}
                className="w-full p-3 rounded-lg flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">📋</span>
                <span className="font-medium text-gray-700">Diğer</span>
              </button>
            </div>

            <button
              onClick={() => setShowTransferModal(false)}
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
