import mongoose, { Schema } from "mongoose";

const folderItemSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    folder: {
      type: Schema.Types.ObjectId,
      ref: "BlogFolder",
      required: true,
      index: true,
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    itemType: {
      type: String,
      enum: ["own", "saved"],
      required: true,
    },
  },
  { timestamps: true }
);

folderItemSchema.index({ user: 1, blog: 1 }, { unique: true });
folderItemSchema.index({ user: 1, folder: 1 });

const FolderItem = mongoose.model("FolderItem", folderItemSchema);
export default FolderItem;
