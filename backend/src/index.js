import express from 'express';
import userRouter from './user/user.routes.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import TransactionRouter from './transaction/transaction.route.js';
import DashboardRouter from './dashboard/dashboard.route.js';

dotenv.config();
console.log("this file running");

// database connection
import mongoose from 'mongoose';
mongoose.connect(process.env.DB_URL)
.then(() => console.log("database connected"))
.catch(() => console.log("database not connected"));



// app level middleware
import morgan from 'morgan';

const app = express();



app.use(cookieParser());
const allowedOrigins = (process.env.DOMAIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// ✅ ADD THIS HERE
app.get('/', (req, res) => {
    console.log("root route hit");
    
  res.send('Backend is running 🚀');
});

// route level middleware
app.use("/api/user", userRouter);

// Dashboard router
app.use("/api/dashboard", DashboardRouter);

// transaction route
app.use("/api/transaction", TransactionRouter);

const PORT = process.env.PORT || 3030;
app.listen(PORT, () => console.log(`server is running on ${PORT}`));
