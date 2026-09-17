import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type:String,
        required:true,
        unique:true,
        minlength:4,
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
        required:false,
        minlength:6,
    },
    auth0Sub: {
        type: String,
        unique: true,
        sparse: true,
        default: undefined,
    },
    authProviders: {
        type: [String],
        default: [],
    },
    profileImage: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    socialLinks: {
        instagram: {
            type: String,
            default: ""
        },
        linkedin: {
            type: String,
            default: ""
        },
        twitter: {
            type: String,
            default: ""
        }
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

userSchema.pre('save' , async function (next) {
    if (!this.isModified('password') || !this.password) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password , salt);
    next();
})

const User = mongoose.model("User" , userSchema);
export default User;
