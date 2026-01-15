import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { ArrowLeft, Bell, Check, FolderKanban, MessageCircle, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useData();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'success': return <Check className="w-4 h-4 text-green-500" />;
      case 'warning': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    switch (type) {
      case 'info': return 'bg-blue-50 border-l-4 border-blue-500';
      case 'success': return 'bg-green-50 border-l-4 border-green-500';
      case 'warning': return 'bg-yellow-50 border-l-4 border-yellow-500';
      default: return 'bg-indigo-50 border-l-4 border-indigo-500';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    return new Date(date).toLocaleDateString('tr-TR');
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Geri</span>
        </button>
        {unreadCount > 0 && (
          <button 
            onClick={() => notifications.forEach(n => !n.read && markNotificationRead(n.id))}
            className="text-xs text-indigo-600 hover:underline"
          >
            Tümünü okundu işaretle
          </button>
        )}
      </div>

      {/* Başlık */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Bell className="w-6 h-6 text-indigo-600" />
          </div>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Bildirimler</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
          </p>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Bildirim bulunmuyor</p>
          <p className="text-sm text-gray-400 mt-1">Yeni bildirimler burada görünecek</p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Okunmamış Bildirimler */}
          {notifications.filter(n => !n.read).length > 0 && (
            <div className="mb-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                Yeni ({notifications.filter(n => !n.read).length})
              </h2>
              <div className="space-y-2">
                {notifications.filter(n => !n.read).map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => {
                      markNotificationRead(notification.id);
                      if (notification.link) {
                        navigate(notification.link);
                      }
                    }}
                    className={`w-full rounded-xl p-4 shadow-sm text-left transition-all hover:shadow-md ${getTypeColor(notification.type, notification.read)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-800 truncate">{notification.title}</h3>
                          {notification.link?.startsWith('/projects') && (
                            <FolderKanban className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Okunmuş Bildirimler */}
          {notifications.filter(n => n.read).length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                Önceki ({notifications.filter(n => n.read).length})
              </h2>
              <div className="space-y-2">
                {notifications.filter(n => n.read).map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (notification.link) {
                        navigate(notification.link);
                      }
                    }}
                    className="w-full bg-white rounded-xl p-4 shadow-sm text-left transition-all hover:shadow-md opacity-70 hover:opacity-100"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-700 truncate">{notification.title}</h3>
                          {notification.link?.startsWith('/projects') && (
                            <FolderKanban className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
