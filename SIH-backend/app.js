import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { errorHandler } from './middlewares/error.middleware.js';
import ApiError from './utils/apiError.js';

const app = express();

// CORS configuration - must be before any routes
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://sih-seven-flax.vercel.app'
    ];

console.log('Allowed CORS origins:', allowedOrigins);

app.use(cors({
    origin: true, // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
});

// Routes Import
import userRouter from './routes/user.route.js';
import illnessCountRouter from './routes/illnessCount.route.js';
import adminRouter from './routes/admin.route.js';
import hospitalRouter from './routes/hospital.route.js';
import predictionRouter from "./routes/prediction.route.js";
import campRouter from "./routes/camp.route.js";
import ttsRouter from "./routes/tts.route.js";
import employerRouter from "./routes/employer.route.js";
import { apiAuth } from "./middlewares/apikey.middleware.js";

// Routes declaration
app.use("/api", apiAuth);   // All /api routes now secured
app.use("/api/users", userRouter);
app.use("/api/illnesses", illnessCountRouter);
app.use("/api/admins", adminRouter);
app.use("/api/predictions", predictionRouter);
app.use("/api/hospitals", hospitalRouter);
app.use("/api/camps", campRouter);
app.use("/api/tts", ttsRouter);
app.use("/api/employers", employerRouter);

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res, next) => {
    next(new ApiError(404, `Not Found - ${req.originalUrl}`));
});

// Global error handler
app.use(errorHandler);

export default app;
