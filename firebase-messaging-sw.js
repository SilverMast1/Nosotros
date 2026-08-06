// Service Worker de Firebase Cloud Messaging (FCM) para Nosotros
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBIl1halZT4UFTfkV0G4UvAZNPwHTj0uow",
  authDomain: "nosotros-gabriel-alexa.firebaseapp.com",
  databaseURL: "https://nosotros-gabriel-alexa-default-rtdb.firebaseio.com",
  projectId: "nosotros-gabriel-alexa",
  storageBucket: "nosotros-gabriel-alexa.firebasestorage.app",
  messagingSenderId: "539988368666",
  appId: "1:539988368666:web:e65a5d800d295d4ff7e0a3",
  measurementId: "G-B6B5N2KK0V"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Notificación recibida en segundo plano:', payload);
  const title = payload.notification?.title || payload.data?.title || 'Nosotros 💕';
  const options = {
    body: payload.notification?.body || payload.data?.body || '¡Tienes una nueva interacción en vuestro espacio!',
    icon: 'https://silvermast1.github.io/Nosotros/favicon.ico',
    badge: 'https://silvermast1.github.io/Nosotros/favicon.ico',
    vibrate: [200, 100, 200]
  };
  self.registration.showNotification(title, options);
});
