const https = require('https');

// URL de la base de datos de Firebase RTDB
const dbUrl = 'https://nosotros-gabriel-alexa-default-rtdb.firebaseio.com/rooms/230426.json';

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

function sendPush(token, serverKey, title, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      to: token,
      notification: {
        title: title,
        body: body,
        icon: 'https://silvermast1.github.io/Nosotros/favicon.ico',
        badge: 'https://silvermast1.github.io/Nosotros/favicon.ico'
      }
    });

    const options = {
      hostname: 'fcm.googleapis.com',
      path: '/fcm/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${serverKey}`,
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
    if (!room || !room.notificationsConfig) {
      console.log('No notification config found in database.');
      return;
    }

    const config = room.notificationsConfig;
    if (!config.enabled || !config.serverKey) {
      console.log('Notifications are disabled or Server Key is missing.');
      return;
    }

    // Comprobar si ha pasado tiempo desde la última interacción
    const lastUpdated = room.lastUpdated || Date.now();
    const diffHours = (Date.now() - lastUpdated) / (1000 * 60 * 60);

    console.log(`Last updated: ${new Date(lastUpdated).toISOString()}`);
    console.log(`Hours since last update: ${diffHours.toFixed(2)}h`);

    // Si han pasado más de 2.5 horas, enviar recordatorio
    if (diffHours >= 2.5) {
      console.log('Sending reminders...');
      const promises = [];
      if (config.user1Token) {
        promises.push(sendPush(config.user1Token, config.serverKey, '¡Gabriel, vuestro espacio os extraña! 💕', '¿Qué tal si entras a ver qué hay de nuevo? 😍'));
      }
      if (config.user2Token) {
        promises.push(sendPush(config.user2Token, config.serverKey, '¡Alexa, vuestro espacio os extraña! 💕', '¿Qué tal si entras a ver qué hay de nuevo? 😍'));
      }
      
      const results = await Promise.all(promises);
      console.log('Reminders sent successfully:', results);
    } else {
      console.log('Recent activity detected. No reminders sent.');
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

main();
