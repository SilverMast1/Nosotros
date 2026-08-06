const crypto = require('crypto');
const https = require('https');

// Configuración de la base de datos de Firebase Realtime Database
const dbUrl = 'https://nosotros-gabriel-alexa-default-rtdb.firebaseio.com/rooms/230426.json';
const actionsUrl = 'https://nosotros-gabriel-alexa-default-rtdb.firebaseio.com/rooms/230426/actions.json';

const serviceAccount = {
  "type": "service_account",
  "project_id": "nosotros-gabriel-alexa",
  "private_key_id": "645e3116125562d32b0cb5bd6bfc8d87e29d7d6c",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDrqLsgsKm8V1n/\n8w9iXqWbaBJ+gyjLUkOuVmshmkBu6st8WDAmiiNMgoTbPG4MY+26Api0ML0RvlOC\ntyfDYLqCP80uat5Z1z46KrvxAWu+h7dUvaM9hop5nstxgyleKthKWHU+KWmH6Ij7\nNa8pe2fwMbXLcMaISYRwjTdrjD4RtLS4aa8KNfk32yQzsALobSZjyOVNSX44FQTU\nEX3mkFE87dSoKP73OLtPk85maoFmK0NSSxqXSg/wCyirZ/8FeGHZygHc0EyMn2/1\n7qypAMySEKWATLygbaKtS/i7eCA4cIT1J2UwV9mKENWMFxiHgizTA0T4gSXYr961\neFmnPKv/AgMBAAECggEAL9ekjeFvxC3TtrOoxubCJke9oXONP6Hm3ajrvPms5RfD\n0e2xcNGQkwLYaA3fpaJP6/iE+ef/KnACUkJOz0p+8txzEl5d381j87kjSK1qK1cw\nMAMD9gSvbjt/v/7J0jVOjeFhhAoyQ4ZA8QcYFYrZMhlVeATgOWD7g0IYIzxoiX1L\njDc/9hXjN75/5nEITtkQTDYTyh7+T+2U1A+abnQdub6gjvKfhpVpd8zkMU6FtvO6\nZOREx/G65xHuc0U76sYhh2DZmn12+7XtQrP4HljVGiJr/cbvHGOxdvbk1n427lv3\nSJ1xVu26ggzDUWU8TZEgetz5uvW/nt7+6VOI6REBaQKBgQD2ILZHct9XYeh6utrF\nqcH7j0/h0RpR9hxJMzBdb4bAYIJYLGw0j9pBuceorrpTZKGhrQraEFPuwLV7QKSx\nGZTNHfeOJ5yVR7rKyuTfq0Pb2EHIYMRfWAxWyMddyiRZk698dfwTweJGkkeMIM7Q\n+KXLPsVvn+E8T+IFYQ3rKyJGAwKBgQD1HIZIB5e336aXIvZRsz30BtGjGop7Vtmb\nGVaaKZn8CRI40kKfAvims3DUiVK575PNnkXlXBomybAyHhgTfJlJPevyTmp3YtCA\nIvPjiQ/v12P1f196ysKUyKGMHqhjo17kbZuIJTomW3zCOsPyTjQFwwHi+FCXE0TW\nud1GoBXPVQKBgQCq98Ymk3D47hXjSvC05VrON5qxreKulFrJrjkmblYYQ/HG9fSj\n/lkJ1tcOIXFkhD6SY/VpzHXBHzPxTdIZA0ANy4cuw+1M9OqX+6BIjlsw12O6oR1H\nbY4EqqtyRvxBDQmVVw+nWcKoauwwNonzNwVTzWKwS0rV7ld+jRByDyBbqQKBgFd8\ntvE+xIh865lGgWTn9VUEmg79ijA776/Me3zLHIs5MafWZLEc/mOB6OPzn/N97+OU\nep5DIZJ2qs04sJ9D+fKKh40VMCssuf8CesrcQTP6TVNzA0Fw3cL9WawJxVDLHzOp\na7pMj1ThksZA82+pOihUUngQ6bMCza9W6AQtX5uBAoGALCTGj1ilkr824rosJ82E\nLpvR9MZW9tzoKT1iWgp/O6kEemq+Z/eFow9UuaQyODHttM3Wma67u1B68hc5sLpA\npfx2rfV18cJTJp3mYLe5a/Feg4CXWPuKJxJL0X4veTUPaxaU0+R6ubDKRL5zrIXg\nFh2zdwA/mdW55hbHM9sYYQQ=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@nosotros-gabriel-alexa.iam.gserviceaccount.com"
};

const REMINDER_MESSAGES = [
  { title: '¡Vuestro espacio os extraña! 💕', message: '¿Qué tal si entráis a ver qué hay de nuevo hoy? 😍' },
  { title: '¡Hora de enviarle amor a tu pareja! 💋', message: 'Entra al espacio de Nosotros a mandar un beso o sticker. ✨' },
  { title: '¿Qué tal una pregunta diaria? 💬', message: 'Gabriel y Alexa, ¡hay una nueva pregunta o juego esperando! 🎲' },
  { title: '¡Pensando en vosotros! 🥰', message: 'Entra a ver los moods o mandar un abrazo de oso. 🫂' }
];

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

function getAccessToken() {
  return new Promise((resolve, reject) => {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: 'RS256', typ: 'JWT' };
    const payload = {
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/firebase.messaging'
    };

    const base64Url = (str) => Buffer.from(str).toString('base64url');
    const unsignedJwt = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;

    const signer = crypto.createSign('RSA-SHA256');
    signer.update(unsignedJwt);
    const signature = signer.sign(serviceAccount.private_key, 'base64url');

    const jwt = `${unsignedJwt}.${signature}`;

    const postData = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString();

    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(parsed);
        } catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function sendFCMv1Notification(accessToken, token, title, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      message: {
        token: token,
        notification: {
          title: title,
          body: body
        },
        webpush: {
          headers: {
            Urgency: 'high'
          },
          notification: {
            title: title,
            body: body,
            icon: 'https://silvermast1.github.io/Nosotros/favicon.ico'
          }
        }
      }
    });

    const options = {
      hostname: 'fcm.googleapis.com',
      path: `/v1/projects/${serviceAccount.project_id}/messages:send`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let response = '';
      res.on('data', chunk => response += chunk);
      res.on('end', () => resolve(response));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
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
      res.on('data', chunk => response += chunk);
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

    const lastUpdated = room.lastUpdated || Date.now();
    const diffMinutes = (Date.now() - lastUpdated) / (1000 * 60);

    console.log(`Last updated: ${new Date(lastUpdated).toISOString()}`);
    console.log(`Minutes since last update: ${diffMinutes.toFixed(1)}m`);

    if (diffMinutes >= 30) {
      console.log('Sending FCM v1 Push Notification (every 30 minutes)...');
      
      const randomMsg = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
      
      const reminderAction = {
        action: 'notification',
        sender: 'Sistema Nosotros',
        title: randomMsg.title,
        message: randomMsg.message,
        timestamp: Date.now()
      };

      await pushFirebaseAction(reminderAction);

      const accessToken = await getAccessToken();

      const promises = [];
      if (config.user1Token) {
        promises.push(sendFCMv1Notification(accessToken, config.user1Token, randomMsg.title, randomMsg.message));
      }
      if (config.user2Token) {
        promises.push(sendFCMv1Notification(accessToken, config.user2Token, randomMsg.title, randomMsg.message));
      }

      const results = await Promise.all(promises);
      console.log('FCM v1 Push Notification results:', results);
    } else {
      console.log('Recent activity detected under 30 minutes. No reminder needed.');
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

main();
