// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import express, { Application } from 'express';
// import GlobalErrorHandler from './app/middlewares/GlobalErrorHanlder';
// import router from './app/routes';
// import handleNotFoundApi from './errors/handleNotFound';
// const app: Application = express();

// app.use(
//   cors({
//     origin: ['http://localhost:3000', 'https://tsneduglownetwork.com'],
//     credentials: true,
//   }),
// );

// app.use(cookieParser());

// app.get('/', (req, res) => {
//   res.send('Server Working successfully');
// });
// //parser
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // route
// app.use('/api/v1', router);
// // Global Error handler
// app.use(GlobalErrorHandler);

// // handle not found api/ route
// app.use(handleNotFoundApi);

// export default app;

import cookieParser from 'cookie-parser';
// import cors from 'cors';
import express, { Application } from 'express';
import GlobalErrorHandler from './app/middlewares/GlobalErrorHanlder';
import router from './app/routes';
import handleNotFoundApi from './errors/handleNotFound';

const app: Application = express();

// CORS configuration
// app.use(
//   cors({
//     origin: ['http://localhost:3000', 'https://tsneduglownetwork.com'],
//     credentials: true,
//   }),
// );

// Handle OPTIONS requests
// app.options('*', cors());

app.use(cookieParser());

app.get('/', (req, res) => {
  res.send('TSN Server Working successfully');
});

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', router);

// Global Error handler
app.use(GlobalErrorHandler);

// Handle not found API/route
app.use(handleNotFoundApi);

export default app;