const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 4004,
  path: '/api/test',
  method: 'GET',
  timeout: 2000
};

const healthCheck = http.request(options, (res) => {
  console.log(`HEALTH CHECK STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on('error', (err) => {
  console.error('HEALTH CHECK ERROR:', err.message);
  process.exit(1);
});

healthCheck.on('timeout', () => {
  console.error('HEALTH CHECK TIMEOUT');
  healthCheck.abort();
  process.exit(1);
});

healthCheck.end();
