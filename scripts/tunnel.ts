import ngrok from 'ngrok';

async function startTunnel() {
  try {
    const url = await ngrok.connect({
      proto: 'http',
      addr: 8080,
      onLogEvent: (data) => console.log(data),
    });
    console.log('\n✅ Public URL:', url);
    console.log('📱 Share this URL to access your app from anywhere!\n');
  } catch (error) {
    console.error('❌ Tunnel error:', error);
    process.exit(1);
  }
}

startTunnel();
