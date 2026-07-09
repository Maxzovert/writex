import mongoose from "mongoose";

const blogShareSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

blogShareSchema.index({ user: 1, blog: 1 }, { unique: true });

const BlogShare = mongoose.model("BlogShare", blogShareSchema);
export default BlogShare;
