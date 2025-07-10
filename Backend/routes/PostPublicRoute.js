import express from "express";
import getBlogBySlug from "../controller/postPublicController.js";

const publicRouter = express.Router();

publicRouter.get("/:slug" , getBlogBySlug);

export default publicRouter;