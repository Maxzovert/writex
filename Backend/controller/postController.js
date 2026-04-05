import Blog from "../models/postModel.js";

const createBlog = async (req , res) => {
    try {
        const {title, content, category, status, mainImage} = req.body;

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
            mainImage: mainImage || "",
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
        const blogs = await Blog.find({author : req.user.id}).populate("author" , "username profileImage");
        res.status(200).json({
            message : "All Your Blog are fetched",
            blogs
        })
    } catch (error) {
        console.error("Erron in getUserBlogs", error);
        res.status(500).json({message : "Error in postController", error : error.message})
    }
}

const updateBlog = async (req , res) => {
    try {
        const {title , content , category , status , mainImage , description} = req.body;
        const blogId = req.params.id;
        
        const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
        
        // Check for duplicate slug, but exclude the current blog being updated
        const existingPost = await Blog.findOne({slug, _id: { $ne: blogId }});
        if(existingPost){
            return res.status(400).json({message : "Blog with this title already exist"});
        }
        
        const updatePost = await Blog.findByIdAndUpdate(blogId, {title , content , category , status , mainImage , description , slug}, {new : true});
        res.status(200).json({
            message : "Blog Updated",
            post : updatePost
        })
    } catch (error) {
        console.error("Error in updateBlog", error);
        res.status(500).json({message : "Error in postController", error : error.message})
    }
}

const deleteBlog = async (req, res) => {
    try {
        const blogId = req.params.id;

        if (!blogId || !blogId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                message: "Invalid blog ID format. Blog ID must be a valid MongoDB ObjectId." 
            });
        }

        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        if (blog.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own blogs" });
        }

        await Blog.findByIdAndDelete(blogId);
        
        res.status(200).json({
            message: "Blog deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteBlog:", error);
        
        // Handle specific MongoDB errors
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ 
                message: "Invalid blog ID format. Blog ID must be a valid MongoDB ObjectId." 
            });
        }
        
        res.status(500).json({ 
            message: "Error in postController", 
            error: error.message 
        });
    }
};

export default { createBlog, getUserBlogs , updateBlog, deleteBlog};