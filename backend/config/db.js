import mongoose from 'mongoose';

export const connectDB = async() =>{
    await mongoose.connect('mongodb+srv://akshitmittal5475:PyraXPq27wUICW3E@akshitmittal.pqmz67y.mongodb.net/Resume')
    .then(()=> console.log("MongoDB connected"))
    .catch((error) => console.log("MongoDB connection failed", error));
}