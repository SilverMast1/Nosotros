const https = require('https');

// URL de la base de datos de Firebase Realtime Database (Free Tier)
const dbUrl = 'https://nosotros-gabriel-alexa-default-rtdb.firebaseio.com/rooms/230426.json';
const actionsUrl = 'https://nosotros-gabriel-alexa-default-rtdb.firebaseio.com/rooms/230426/actions.json';

function getFirebaseData() {
  return new Promise((resolve, reject) => {
    https.get(dbUrl, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function pushFirebaseAction(actionData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(actionData);
    const parsedUrl = new URL(actionsUrl);

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let response = '';
      res.on('data', (chunk) => response += chunk);
      res.on('end', () => resolve(response));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    const room = await getFirebaseData();
    if (!room) {
      console.log('No database room found.');
      return;
    }

    const config = room.notificationsConfig || {};
    if (config.enabled === false) {
      console.log('Notifications are explicitly disabled in room config.');
      return;
    }

    // Comprobar si ha pasado tiempo desde la última interacción
    const lastUpdated = room.lastUpdated || Date.now();
    const diffHours = (Date.now() - lastUpdated) / (1000 * 60 * 60);

    console.log(`Last updated: ${new Date(lastUpdated).toISOString()}`);
    console.log(`Hours since last update: ${diffHours.toFixed(2)}h`);

    // Si han pasado más de 2.5 horas, registrar recordatorio en Firebase Realtime Database
    if (diffHours >= 2.5) {
      console.log('Sending reminder actions to Firebase Realtime Database...');
      
      const reminderAction = {
        action: 'reminder',
        sender: 'Sistema Nosotros',
        title: '¡Vuestro espacio os extraña! 💕',
        message: '¿Qué tal si entráis a ver qué hay de nuevo? 😍',
        timestamp: Date.now()
      };

      const result = await pushFirebaseAction(reminderAction);
      console.log('Reminder pushed successfully to Firebase:', result);
    } else {
      console.log('Recent activity detected. No reminder needed.');
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

main();
