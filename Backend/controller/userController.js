import User from "../models/userModel";


const generateToken = (user) => {
    return jwt.sign({id:user._id}, process.env.JWT_SECRET,{
        expiresIn:'7d'
    })
}
const signUp = async (req , res) => {
    const {username , email , password} = req.body;

    try {
        const userExist = await User.findOne({email});
        if(userExist){ 
            return res.status(400).json({message:"User Already Exists"})
        }

        const user = await User.create({username , email, password});
        const token = generateToken(user._id)

        res .cookie('token')

        res.status(201).json({
            _id: user._id,
            username:user.username,
            email:user.email,
            message : "user created"
        })
        

    } catch (error) {
        res.status(500).json({message : "error userController (signUp)"})
    }
}

export default signUp;