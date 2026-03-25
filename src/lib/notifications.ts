// ============================================================
// src/lib/notifications.ts
// Browser notifications helper for critical alerts
// ============================================================

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

export function sendAlertNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    const notification = new Notification('OSIRIS Intelligence', {
      body: `${title}\n${body}`,
      icon: '/favicon.ico', // fallback icon
      tag: 'osiris-alert',
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (err) {
    console.error('Notification failed:', err);
  }
}
