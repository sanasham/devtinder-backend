import cookieParser from 'cookie-parser';
import express from 'express';
import authRouter from './router/authRouter.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(authRouter);

export default app;
