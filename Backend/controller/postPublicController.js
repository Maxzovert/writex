import Blog from "../models/postModel.js";

const getAllBlogs = async() => {
    try {
        // const allBlogs = await 
    } catch (error) {
        
    }
}

const getBlogBySlug = async (req , res) => {
    try {
        const {slug} = req.params;

        const blog = await Blog.findOne({slug}).populate("author" , "username");

        if(!blog){
            return res.status(404).json({message : "Blog Not Found"})
        }
        res.status(200).json({
            message : "Blog Finded",
            post : blog
        });
    } catch (error) {
        console.error("Error in getBlogBySlug", error);
        res.status(500).json({message : "Failed to fetch error in post public controller" , error : error.message})
    }
};

export default getBlogBySlug