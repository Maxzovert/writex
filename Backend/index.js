import express from "express";
import dotenv from "dotenv";
import connetDB from "./config/db.js";
import cookieParser from "cookie-parser";
import router from "./routes/userRoute.js";
import cors from "cors";
import postRouter from "./routes/PostUserRoute.js";
import publicRouter from "./routes/PostPublicRoute.js";
import interactionRouter from "./routes/interactionRoute.js";

dotenv.config();
const app = express();



connetDB();

// // Enable CORS

// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
//   credentials: true 
// }));

// Production

app.use(cors({
  origin: 'https://writtex.onrender.com', // Vite's default port
  credentials: true // This is important for cooSkies
}));

// app.options('*', cors());

// app.use(cookieParser());
// Default Express JSON limit (~100kb) causes 413 for long posts / many images (URLs in JSON).
// Cap below MongoDB's 16MB per-document limit.
const jsonBodyLimit = process.env.JSON_BODY_LIMIT || "12mb";
app.use(express.json({ limit: jsonBodyLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonBodyLimit }));

// app.get("/", (req, res) => {
//   res.send("Back running");
// });

// Test route to verify backend is working
app.get("/test", (req, res) => {
  res.json({ message: "Backend is running", timestamp: new Date().toISOString() });
});

// Test route for blog endpoints
app.get("/blog/test", (req, res) => {
  res.json({ message: "Blog routes are accessible", timestamp: new Date().toISOString() });
});

app.use("/users", router);
app.use("/blog/",postRouter);
app.use("/public/posts/",publicRouter);
app.use("/api/interactions/",interactionRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
