import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/role';
import auth from '../../middlewares/auth';
import { jobController } from './job.controller';

const router = express.Router();

router.get(
  '/',
  auth(
    ENUM_USER_ROLE.AGENT,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
  ),
  jobController.getSpecificUserOrAdminJob,
);

router.get('/ready', jobController.getAllJobs);

router.get('/:id', jobController.getSpecificJob);

router.post('/', auth(ENUM_USER_ROLE.AGENT), jobController.createJob);

router.patch(
  '/:id',
  auth(
    ENUM_USER_ROLE.AGENT,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
  ),
  jobController.updateJob,
);

export const jobRoute = router;
