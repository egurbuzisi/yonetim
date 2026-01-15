// Bildirim sesi - Web Audio API kullanarak zil sesi oluşturur

let audioContext: AudioContext | null = null;

export const playNotificationSound = () => {
  try {
    // AudioContext oluştur (lazy initialization)
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Basit bir "ding" sesi oluştur
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Zil benzeri ses ayarları
    oscillator.frequency.setValueAtTime(830, audioContext.currentTime); // E5 nota
    oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E4 nota
    
    oscillator.type = 'sine';

    // Ses şiddeti (fade out efekti)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    // Sesi çal
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

  } catch (error) {
    console.log('Bildirim sesi çalınamadı:', error);
  }
};

// Çift zil sesi (daha belirgin)
export const playDoubleNotificationSound = () => {
  playNotificationSound();
  setTimeout(() => playNotificationSound(), 200);
};
