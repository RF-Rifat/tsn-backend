/**
 * Title: 'Application'
 * Description: ''
 * Author: 'Masum Rana'
 * Date: 27-12-2023
 *
 */

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application } from 'express';
import GlobalErrorHandler from './app/middlewares/GlobalErrorHanlder';
import router from './app/routes';
import handleNotFoundApi from './errors/handleNotFound';
const app: Application = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://tsneduglownetwork.com',
      'https://tsn-backend.net',
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
