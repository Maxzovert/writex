import mongoose, { Schema } from "mongoose";

const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    content: {
        type: Schema.Types.Mixed,
        required: true
    },
    // excerpt: {
    //     type: String,
    //     default: ""
    // },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    // tags: [{
    //     type: String
    // }],
    category: {
        type: String,
        default: 'general',
        required : true
    },
    profileImage: {
        type: String
    },
    postImage: {
        type : String
    },
    imageAlt: {
        type: String
    },
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    readTime: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true // This will automatically handle createdAt and updatedAt
})

// Index for better query performance
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ slug: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ createdAt: -1 });

const Blog = mongoose.model("Blog", blogSchema );
export default Blog;