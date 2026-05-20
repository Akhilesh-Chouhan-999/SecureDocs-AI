const http = require("http");
const app = require("./app");
const { connectDB, env } = require("./config");
const { initializeSockets } = require("./sockets");
const { logger } = require("./logs");

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  initializeSockets(server);

  server.listen(env.port, () => {
    logger.info("Server started", {
      port: env.port,
      host: env.host,
      environment: env.nodeEnv,
    });
  });

  return server;
};

if (require.main === module) {
  startServer().catch((error) => {
    logger.error("Failed to start server", { message: error.message });
    process.exit(1);
  });
}

module.exports = {
  app,
  startServer,
};
