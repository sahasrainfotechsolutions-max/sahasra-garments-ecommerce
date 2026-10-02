const net = require('net');

const host = 'aws-0-ap-southeast-1.pooler.supabase.com';
const ports = [6543, 5432];

function testPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ port, success: false, error: 'TIMEOUT' });
    }, 10000);

    socket.connect(port, host, () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ port, success: true });
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      socket.destroy();
      resolve({
        port,
        success: false,
        error: err.code || err.message,
      });
    });
  });
}

(async () => {
  console.log(`Testing ${host}`);

  for (const port of ports) {
    const result = await testPort(port);

    if (result.success) {
      console.log(`TCP ${port}: SUCCESS`);
    } else {
      console.log(`TCP ${port}: FAILED - ${result.error}`);
    }
  }
})();