import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generatetoken = (userId) =>{
    // Generate a JWT token(payload, secret)
    //payload -> data to be stored in token
    //secret -> a private key stored in env variables
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: '2d'});
}
//Sign up function
export const registerUser = async(req, res)=>{
    try{
        const {name, email, password} = req.body;

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists"});
        }
        if(password.length < 6){
            return res.status(400).json({message: "Password should be atleast 6 characters"});
        }
        //generate a salt(random string) to hash password
        const salt = await bcrypt.genSalt(10);
        //combine password and salt to make a secured hashed password
        const hashedpassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name, 
            email, 
            password: hashedpassword
        })
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generatetoken(user._id)
        })
    }
    catch(error){
        return res.status(500).json({message: "Server Error"});
    }
}


//Login function
export const loginUser = async(req, res)=>{
    try{
        const {email, password} = req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({message: "Invalid email or password"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid email or password"});
        }
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generatetoken(user._id)
        })
    }
    catch(error){
        return res.status(500).json({message: "Server Error"});
    }  
}


//Get User Profile
export const getUserProfile = async(req, res) =>{
    try{
        const user = await User.findById(req.user.id).select('-password')
        if(!user){
            return res.status(404).json({message: "User Not Found"});
        }
        res.json(user);
    }
    catch(error){
        res.status(500).json({message: "Server Error"})
    }
}