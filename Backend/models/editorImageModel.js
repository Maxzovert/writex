import mongoose from "mongoose";

const editorImageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    size: {
        type: Number,
        required: true
    }
});

const EditorImage = mongoose.model("EditorImage", editorImageSchema);
export default EditorImage;
