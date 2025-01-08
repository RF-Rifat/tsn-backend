import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { catalogRoutes } from '../modules/catalog/catalog.route';
import { profileRoute } from '../modules/profile/profile.route';
import { UserRoutes } from '../modules/user/user.route';
import { jobRoute } from '../modules/job/job.route';
import { universityRoute } from '../modules/university/university.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/profile',
    route: profileRoute,
  },
  {
    path: '/catalog',
    route: catalogRoutes,
  },
  {
    path: '/job',
    route: jobRoute,
  },
  {
    path: '/university',
    route: universityRoute,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
