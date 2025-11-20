import express from "express";
import cors from "cors";

import router from "./routes";
import config from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "Bookstore API",
    environment: config.env,
  });
});

app.use("/api", router);

export default app;
