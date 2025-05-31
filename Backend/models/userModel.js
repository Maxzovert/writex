import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        required:true,
        unique:true,
        minlength:5,
    },
    email: {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
    },
    password: {
        type:String,
        required:true,
        minlength:6,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model("User" , userSchema);
export default User;