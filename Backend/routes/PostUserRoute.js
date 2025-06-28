import express from "express";
import postController from '../controller/postController.js'
import protectRoute from "../middleware/auth.js";
// import router from "./userRoute.js";


const postRouter = express.Router();

postRouter.post("/addblog", protectRoute, postController);

export default postRouter;