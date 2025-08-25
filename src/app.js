import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
// import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
// import xss from 'xss-clean';
import { errorHandler } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiters.js';
import authRouter from './router/authRouter.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
const allowlist = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow non-browser tools
      return allowlist.includes(origin)
        ? cb(null, true)
        : cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
// if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(cookieParser());
// app.use(mongoSanitize());
// app.use(xss());
app.use(hpp());
app.use(compression());
app.use(globalLimiter);
app.use('/', authRouter);
// app.use('*', (req, res) =>
//   res.status(404).json({ message: 'Route not found' })
// );
app.use(errorHandler);
export default app;
