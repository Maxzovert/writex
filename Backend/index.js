import express from "express";
import dotenv from "dotenv";
import compression from "compression";
import connetDB from "./config/db.js";
import cors from "cors";
import router from "./routes/userRoute.js";
import postRouter from "./routes/PostUserRoute.js";
import publicRouter from "./routes/PostPublicRoute.js";
import interactionRouter from "./routes/interactionRoute.js";
import notificationRouter from "./routes/notificationRoute.js";
import { purgeExpiredTrash } from "./utils/trash.js";

dotenv.config();
const app = express();

app.use(compression());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://writtex.onrender.com",
    ],
    credentials: true,
  })
);

const jsonBodyLimit = process.env.JSON_BODY_LIMIT || "12mb";
app.use(express.json({ limit: jsonBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonBodyLimit }));

app.get("/test", (req, res) => {
  res.json({
    message: "Backend is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/blog/test", (req, res) => {
  res.json({
    message: "Blog routes are accessible",
    timestamp: new Date().toISOString(),
  });
});

app.use("/users", router);
app.use("/blog/", postRouter);
app.use("/public/posts/", publicRouter);
app.use("/api/interactions/", interactionRouter);
app.use("/api/notifications", notificationRouter);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connetDB();

  // Purge recycle-bin items older than 60 days on boot and daily
  const runTrashPurge = async () => {
    try {
      const { purged } = await purgeExpiredTrash();
      if (purged > 0) {
        console.log(`Recycle bin: permanently removed ${purged} expired blog(s)`);
      }
    } catch (err) {
      console.error("Recycle bin purge failed:", err);
    }
  };
  await runTrashPurge();
  setInterval(runTrashPurge, 24 * 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

start();
