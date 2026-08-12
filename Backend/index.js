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
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

start();
