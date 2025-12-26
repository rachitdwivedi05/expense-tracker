import express from 'express';
import userRouter from './user/user.routes.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

// database connection
import mongoose from 'mongoose';
mongoose.connect(process.env.DB_URL)
.then(() => console.log("database connected"))
.catch(() => console.log("database not connected"));



// app level middleware
import morgan from 'morgan';

const app = express();
app.listen(3030, () => console.log("server is running on 3030"));


app.use(cookieParser());
app.use(cors({
    origin: process.env.DOMAIN
}));


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// route level middleware
app.use("/api/user", userRouter);