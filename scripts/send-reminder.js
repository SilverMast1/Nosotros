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

function sendWebpushrNotification(restKey, authToken, targetRole, title, message) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      title: title,
      message: message,
      target_url: 'https://silvermast1.github.io/Nosotros/',
      attribute: [
        {
          key: 'user_id',
          value: targetRole
        }
      ]
    });

    const options = {
      hostname: 'api.webpushr.com',
      path: '/v1/notification/send/attribute',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'webpushrKey': restKey,
        'webpushrAuthToken': authToken,
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
    if (!config.enabled || !config.restKey || !config.authToken) {
      console.log('Notifications are disabled or Webpushr credentials are missing.');
      return;
    }

    // Comprobar si ha pasado tiempo desde la última interacción
    const lastUpdated = room.lastUpdated || Date.now();
    const diffHours = (Date.now() - lastUpdated) / (1000 * 60 * 60);

    console.log(`Last updated: ${new Date(lastUpdated).toISOString()}`);
    console.log(`Hours since last update: ${diffHours.toFixed(2)}h`);

    // Si han pasado más de 2.5 horas, enviar recordatorio
    if (diffHours >= 2.5) {
      console.log('Sending reminders via Webpushr...');
      const promises = [];
      
      // Gabriel es 'user1', Alexa es 'user2'
      promises.push(sendWebpushrNotification(config.restKey, config.authToken, 'user1', '¡Gabriel, vuestro espacio os extraña! 💕', '¿Qué tal si entras a ver qué hay de nuevo? 😍'));
      promises.push(sendWebpushrNotification(config.restKey, config.authToken, 'user2', '¡Alexa, vuestro espacio os extraña! 💕', '¿Qué tal si entras a ver qué hay de nuevo? 😍'));
      
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
