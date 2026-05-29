import express from 'express';
import userRouter from './user/user.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import TransactionRouter from './transaction/transaction.route.js';
import DashboardRouter from './dashboard/dashboard.route.js';
import { assertRequiredEnv, getClientOrigins, isProduction, mongoUri } from './config/env.js';

assertRequiredEnv();

// database connection
import mongoose from 'mongoose';
// Render/Atlas use MONGO_URI; connection timeout prevents long startup hangs on bad env values.
mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
})
.then(() => console.log("database connected"))
.catch((error) => console.error("database not connected:", error.message));



// app level middleware
import morgan from 'morgan';

const app = express();

app.set("trust proxy", 1);


app.use(cookieParser());
const allowedOrigins = getClientOrigins()
    .map((origin) => {
        try {
            return new URL(origin).origin;
        } catch {
            return origin;
        }
    });
const allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    try {
        const { hostname } = new URL(origin);

        // Allow configured production domains, local development, and Vercel preview redeploy URLs.
        return (
            allowedOrigins.includes(new URL(origin).origin) ||
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "::1" ||
            hostname === "vercel.app" ||
            hostname.endsWith(".vercel.app")
        );
    } catch {
        return false;
    }
};

const corsOptions = {
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: allowedMethods,
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// ✅ ADD THIS HERE
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// route level middleware
app.get('/health', (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const database = dbStates[mongoose.connection.readyState] || "unknown";

  res.status(database === "connected" ? 200 : 503).json({
    status: "ok",
    database,
  });
});

app.use("/api/user", userRouter);

// Dashboard router
app.use("/api/dashboard", DashboardRouter);

// transaction route
app.use("/api/transaction", TransactionRouter);

// Keep production errors consistent without leaking stack traces to the browser.
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(err.status || 500).json({
        message: isProduction ? "Internal Server Error" : err.message,
    });
});

// Render injects PORT; 5000 is the local fallback requested for production readiness.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on ${PORT}`));
