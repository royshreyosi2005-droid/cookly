import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();

const HOST = '0.0.0.0';

const server = app.listen(config.port, HOST, () => {
  console.log(`=============================================`);
  console.log(`🚀 Cookly Backend Server is running!`);
  console.log(`🌐 Host: ${HOST} | Port: ${config.port}`);
  console.log(`⚙️  Environment: ${config.nodeEnv}`);
  console.log(`🩺 Health Check: http://${HOST}:${config.port}/api/health`);
  console.log(`🔗 Allowed Origin: ${config.clientOrigin}`);
  console.log(`=============================================`);
});

// Graceful shutdown handling
const shutdown = () => {
  console.log('\nGracefully shutting down server...');
  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { app, server };
