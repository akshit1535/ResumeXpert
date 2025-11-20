import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRouter.js';
import resumeRouter from './routes/resumeRouter.js';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const app = express();
const PORT = 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', userRouter);
app.use('/api/resume', resumeRouter);

app.use('/uploads', express.static(path.join(dirname, '/uploads'), {
    setHeaders: (res, _path)=>{
        res.set("Access-Control-Allow-Origin", 'http://localhost:5173')
    }
})); 

app.get('/', (req, res)=>{
    res.send("Working");
})

app.listen(PORT, ()=>{
    console.log("Server is Running");
})