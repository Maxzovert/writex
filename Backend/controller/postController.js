import Blog from "../models/postModel.js";

const createBlog = async (req , res) => {
    try {
        const {title, content, category, status, profileImage, mainImage, imageAlt} = req.body;

        const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

        const existingPost = await Blog.findOne({slug});
        if(existingPost){
            return res.status(400).json({message : "Blog with this title already exist"});
        }

        const newPost = new Blog({
            title,
            content,
            author: req.user.id,
            category: category || 'general',
            mainImage,
            imageAlt,
            profileImage,
            slug,
            status : status || 'draft',
        })

        const savedPost = await newPost.save();
        await savedPost.populate('author','username');

        res.status(201).json({
            message : "Blog Published",
            post  : savedPost
        });

        } catch (error) {
        console.error("Error in Create Blog" , error);
        res.status(500).json({message : "Error in Post Controller" , error : error.message})
    }
}

const getUserBlogs = async (req , res) => {
    try {
        const blogs = await Blog.find({author : req.user.id}).populate("author" , "username");
        res.status(200).json({
            message : "All Your Blog are fetched",
            blogs
        })
    } catch (error) {
        console.error("Erron in getUserBlogs", error);
        res.status(500).json({message : "Error in postController", error : error.message})
    }
}

import EditorImage from "../models/editorImageModel.js";

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Create the URL for the uploaded image
        const imageUrl = `/uploads/${req.file.filename}`; // Return relative URL

        // Save image info to MongoDB
        const editorImage = new EditorImage({
            filename: req.file.filename,
            url: imageUrl,
            uploader: req.user.id, // From auth middleware
            size: req.file.size
        });

        await editorImage.save();

        // Return the URL that TipTap editor can use
        res.status(200).json({
            url: imageUrl,
            message: "Image uploaded successfully",
            location: imageUrl // For compatibility with some image upload handlers
        });
    } catch (error) {
        console.error("Error in uploading files", error);
        res.status(500).json({ 
            message: "Error uploading image",
            error: error.message 
        });
    }
}

export default { createBlog, getUserBlogs, uploadImage };