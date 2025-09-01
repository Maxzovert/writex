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
        console.log("Delete request received for blog ID:", blogId);
        console.log("User ID from request:", req.user?.id);
        console.log("Request headers:", req.headers);
        
        // Validate ObjectId format
        if (!blogId || !blogId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log("Invalid ObjectId format:", blogId);
            return res.status(400).json({ 
                message: "Invalid blog ID format. Blog ID must be a valid MongoDB ObjectId." 
            });
        }
        
        // Check if the blog exists and belongs to the user
        const blog = await Blog.findById(blogId);
        console.log("Blog found:", blog ? "Yes" : "No");
        
        if (!blog) {
            console.log("Blog not found, returning 404");
            return res.status(404).json({ message: "Blog not found" });
        }
        
        console.log("Blog author:", blog.author);
        console.log("Request user ID:", req.user.id);
        console.log("Author comparison:", blog.author.toString() !== req.user.id);
        
        if (blog.author.toString() !== req.user.id) {
            console.log("User not authorized to delete this blog, returning 403");
            return res.status(403).json({ message: "You can only delete your own blogs" });
        }
        
        // Delete the blog
        console.log("Deleting blog...");
        await Blog.findByIdAndDelete(blogId);
        console.log("Blog deleted successfully");
        
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