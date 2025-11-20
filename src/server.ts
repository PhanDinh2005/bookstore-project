import app from "./app";
import config from "./config/env";

const server = app.listen(config.port, () => {
  console.log(`🚀 Bookstore API running on port ${config.port}`);
});

const gracefulShutdown = () => {
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
