import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { AppError, globalErrorHandler } from './utils/app-error';
import userRouter from './modules/users/routes/routes';
import cookieParser from 'cookie-parser';
import organizationRouter from './modules/organization/routes/routes';
import vouchersRouter from './modules/vouchers/routes/routes';
import smtpSettingsRouter from './modules/smtp/routes/routes';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// const limiter = rateLimit({
//   max: 5, // max requests
//   windowMs: 60 * 60 * 1000, // 1 hour
//   handler: (req, res, next, options) => {
//     // You can fully customize this response
//     return res.status(options.statusCode).json({
//       code: 429,
//       status: 'error',
//       message: `You have exceeded the ${options.max} requests in ${
//         options.windowMs / (60 * 1000)
//       } minutes limit.`,
//       retryAfter: `${Math.ceil(options.windowMs / (60 * 1000))} minutes`,
//     });
//   },
// });

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: 'http://localhost:3000', // your frontend URL
    credentials: true, // allow cookies to be sent
  })
);

app.use(helmet());

// app.use('/api', limiter);

app.use('/api/v1/organization', organizationRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/voucher', vouchersRouter);
app.use('/api/v1/smtp', smtpSettingsRouter);

app.get('/api/v1/health', (_, res) => {
  res.send('All Ok');
});

app.use((req, _, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  const err = new AppError(
    `Can't find ${req.originalUrl} on the server! `,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
