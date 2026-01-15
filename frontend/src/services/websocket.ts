// WebSocket Service - Real-time mesajlaşma için

// Dinamik WebSocket URL - telefondan da çalışır
const getWsUrl = () => {
  const host = window.location.hostname;
  return `ws://${host}:5001`;
};

type MessageHandler = (data: any) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private watchingProjects: string[] = [];
  private watchingAgendas: string[] = [];

  // WebSocket'e bağlan
  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.userId = userId;
    
    try {
      this.ws = new WebSocket(getWsUrl());

      this.ws.onopen = () => {
        console.log('🔌 WebSocket bağlandı');
        this.reconnectAttempts = 0;
        
        // Kullanıcı kaydı yap
        this.send({ type: 'register', userId });
        
        // Önceden izlenen projeleri tekrar izle
        this.watchingProjects.forEach(projectId => {
          this.send({ type: 'watch_project', projectId });
        });
        
        // Önceden izlenen gündemleri tekrar izle
        this.watchingAgendas.forEach(agendaId => {
          this.send({ type: 'watch_agenda', agendaId });
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (err) {
          console.error('WebSocket mesaj parse hatası:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 WebSocket bağlantısı kapandı');
        this.tryReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket hatası:', error);
      };
    } catch (err) {
      console.error('WebSocket bağlantı hatası:', err);
      this.tryReconnect();
    }
  }

  // Bağlantıyı kapat
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.userId = null;
    this.watchingProjects = [];
    this.watchingAgendas = [];
  }

  // Yeniden bağlanmayı dene
  private tryReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      console.log(`🔄 WebSocket yeniden bağlanıyor... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        if (this.userId) {
          this.connect(this.userId);
        }
      }, 2000 * this.reconnectAttempts);
    }
  }

  // Mesaj gönder
  private send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  // Proje izlemeye başla
  watchProject(projectId: string) {
    if (!this.watchingProjects.includes(projectId)) {
      this.watchingProjects.push(projectId);
    }
    this.send({ type: 'watch_project', projectId });
  }

  // Proje izlemeyi bırak
  unwatchProject(projectId: string) {
    this.watchingProjects = this.watchingProjects.filter(p => p !== projectId);
    this.send({ type: 'unwatch_project', projectId });
  }

  // Gündem izlemeye başla
  watchAgenda(agendaId: string) {
    if (!this.watchingAgendas.includes(agendaId)) {
      this.watchingAgendas.push(agendaId);
    }
    this.send({ type: 'watch_agenda', agendaId });
  }

  // Gündem izlemeyi bırak
  unwatchAgenda(agendaId: string) {
    this.watchingAgendas = this.watchingAgendas.filter(a => a !== agendaId);
    this.send({ type: 'unwatch_agenda', agendaId });
  }

  // Event handler ekle
  on(eventType: string, handler: MessageHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    
    // Cleanup fonksiyonu döndür
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  // Event handler kaldır
  off(eventType: string, handler: MessageHandler) {
    this.handlers.get(eventType)?.delete(handler);
  }

  // Gelen mesajları işle
  private handleMessage(data: any) {
    const handlers = this.handlers.get(data.type);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
    
    // Genel 'message' handler'ları da çağır
    const allHandlers = this.handlers.get('*');
    if (allHandlers) {
      allHandlers.forEach(handler => handler(data));
    }
  }
}

// Singleton instance
export const wsService = new WebSocketService();
