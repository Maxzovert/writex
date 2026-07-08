import mongoose, { Schema } from "mongoose";

const blogFolderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "BlogFolder",
      default: null,
    },
    color: {
      type: String,
      default: "#BBDEFB",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

blogFolderSchema.index({ user: 1, parent: 1 });

const BlogFolder = mongoose.model("BlogFolder", blogFolderSchema);
export default BlogFolder;
