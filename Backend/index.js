import express from "express";
import dotenv from "dotenv";
import connetDB from "./config/db.js";


dotenv.config();
const app = express();

const PORT = process.env.PORT;
connetDB();
app.listen(PORT, () => {
    console.log("Running on " + PORT)
})