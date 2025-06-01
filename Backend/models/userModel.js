import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

userSchema.pre('save' , async function (next) {
    if(!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password , salt);
    next();
})

const User = mongoose.model("User" , userSchema);
export default User;