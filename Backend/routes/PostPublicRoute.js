import express from "express";
import postPublicController from "../controller/postPublicController.js";

const publicRouter = express.Router();

publicRouter.get("/blogs" , postPublicController.getAllBlogs);
publicRouter.get("/:slug" , postPublicController.getBlogBySlug);

export default publicRouter;