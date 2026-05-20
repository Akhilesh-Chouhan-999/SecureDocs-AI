import http from "http";
import { fileURLToPath } from "url";
import app from "./app.js";
import { connectDB, env } from "./config/index.js";
import { initializeSockets } from "./sockets/index.js";
import { logger } from "./logs/index.js";

const __filename = fileURLToPath(import.meta.url);

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

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((error) => {
    logger.error("Failed to start server", { message: error.message });
    process.exit(1);
  });
}

export { app, startServer };
