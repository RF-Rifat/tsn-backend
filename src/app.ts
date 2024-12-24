/**
 * Title: 'Application'
 * Description: ''
 * Author: 'Masum Rana'
 * Date: 27-12-2023
 *
 */

import express, { Application } from 'express';
import cors from 'cors';
import GlobalErrorHandler from './app/middlewares/GlobalErrorHanlder';
import handleNotFoundApi from './errors/handleNotFound';
import router from './app/routes';
import cookieParser from 'cookie-parser';
const app: Application = express();

app.use(
  cors({
    origin: [
      'http://localhost:8000',
      'https://online-staff.vercel.app',
      'https://www.tns-backend.net',
      'https://tns-backend.net',
    ],
    credentials: true,
  }),
);

app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('Server Working successfully');
});
//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// route
app.use('/api/v1', router);
// Global Error handler
app.use(GlobalErrorHandler);

// handle not found api/ route
app.use(handleNotFoundApi);

export default app;
