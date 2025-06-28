import Blog from "../models/postModel.js";
import User from "../models/userModel.js";

const createBlog = async (req,res)=> {
    try {
        const {title, content, category, profileImage , postImage, imageAlt} = req.body;

        const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

        const existingPost = await Blog.findOne({slug});
        if(existingPost){
            return res.status(400).json({message : "A Blog with this title already exists"});
        }

        const newPost = new Blog({
            title,
            content,
            author: req.user.id,
            category: category || 'general',
            postImage,
            imageAlt,
            profileImage,
            slug,
            status : "draft"
        })

        const savedPost = await newPost.save();
        await savedPost.populate('author' , 'username');

        res.status(201).json({
            message : "Blog Published",
            post : savedPost
        })
    } catch (error) {
        console.error("Error in Create blog" , error);
        res.status(500).json({message : "Error In blog post" , error : error.message});
    }
};

export default createBlog;