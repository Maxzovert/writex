import express from "express";
import userController from "../controller/userController.js";
import protectRoute from "../middleware/auth.js";

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/current', protectRoute, userController.getCurrentUser);
router.get('/profile-stats', protectRoute, userController.getUserProfileStats);
router.put('/profile-image', protectRoute, userController.updateProfileImage);
router.put('/profile', protectRoute, userController.updateProfile);
router.post('/logout', userController.logout);

// router.get("/protected", protectRoute, (req, res) => {
//     res.json({ message: "You are authorized!", user: req.user });
//   });
export default router;