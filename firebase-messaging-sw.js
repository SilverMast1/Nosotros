// Service Worker de Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Inicializar la app de Firebase dentro del Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyBIl1halZT4UFTfkV0G4UvAZNPwHTj0uow",
  authDomain: "nosotros-gabriel-alexa.firebaseapp.com",
  databaseURL: "https://nosotros-gabriel-alexa-default-rtdb.firebaseio.com",
  projectId: "nosotros-gabriel-alexa",
  storageBucket: "nosotros-gabriel-alexa.firebasestorage.app",
  messagingSenderId: "539988368666",
  appId: "1:539988368666:web:e65a5d800d295d4ff7e0a3"
});

const messaging = firebase.messaging();

// Manejador de notificaciones en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Recibido mensaje en segundo plano:', payload);
  
  if (payload.notification) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon || 'https://silvermast1.github.io/Nosotros/favicon.ico',
      badge: 'https://silvermast1.github.io/Nosotros/favicon.ico',
      data: payload.data
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
