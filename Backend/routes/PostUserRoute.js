import express from "express";
import postController from '../controller/postController.js'
import folderController from '../controller/folderController.js'
import protectRoute from "../middleware/auth.js";

const postRouter = express.Router();

postRouter.post("/addblog", protectRoute, postController.createBlog);
postRouter.get("/myblogs" , protectRoute , postController.getUserBlogs);
postRouter.put("/updateblog/:id" , protectRoute , postController.updateBlog);
postRouter.delete("/deleteblog/:id" , protectRoute , postController.deleteBlog);

postRouter.get("/folders/tree", protectRoute, folderController.getFolderTree);
postRouter.get("/library", protectRoute, folderController.getLibraryContents);
postRouter.post("/folders", protectRoute, folderController.createFolder);
postRouter.put("/folders/:id", protectRoute, folderController.updateFolder);
postRouter.delete("/folders/:id", protectRoute, folderController.deleteFolder);
postRouter.post("/folders/:id/items", protectRoute, folderController.addItemToFolder);
postRouter.put("/library/move", protectRoute, folderController.moveItem);
postRouter.delete("/library/items/:blogId", protectRoute, folderController.removeItem);

export default postRouter;