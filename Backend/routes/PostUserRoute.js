import express from "express";
import postController from '../controller/postController.js'
import protectRoute from "../middleware/auth.js";
import multer from "multer";

const postRouter = express.Router();

postRouter.post("/addblog", protectRoute, postController.createBlog);
postRouter.get("/myblogs" , protectRoute , postController.getUserBlogs);

export default postRouter;