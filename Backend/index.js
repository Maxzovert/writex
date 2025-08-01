import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import connetDB from "./config/db.js";
import cookieParser from "cookie-parser";
import router from "./routes/userRoute.js";
import cors from "cors";
import postRouter from "./routes/PostUserRoute.js";
import publicRouter from "./routes/PostPublicRoute.js";
import uploadRouter from "./routes/uploadRoute.js";

dotenv.config();
const app = express();

connetDB();

// Enable CORS
// app.use(cors({
//   origin: 'http://localhost:5173', // No trailing slash!
//   credentials: true // This is important for cookies
// }));

// Production

app.use(cors({
  origin: 'https://writtex.onrender.com', // Vite's default port
  credentials: true // This is important for cookies
}));

// app.options('*', cors());

// app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//   res.send("Back running");
// });

app.use("/users", router);
app.use("/blog/",postRouter);
app.use("/public/posts/",publicRouter);
app.use("/upload", uploadRouter);
app.use("/uploads", express.static("uploads"));

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Running on " + 5000);
});
