import express from "express";

import signUp from "../controller/userController";
import protectRoute from "../middleware/auth";

const router = express.Router();

router.post('/signUp', signUp)