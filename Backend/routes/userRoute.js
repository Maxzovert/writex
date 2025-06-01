import express from "express";
import userController from "../controller/userController.js";
import protectRoute from "../middleware/auth.js";

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);

// router.get("/protected", protectRoute, (req, res) => {
//     res.json({ message: "You are authorized!", user: req.user });
//   });
export default router;