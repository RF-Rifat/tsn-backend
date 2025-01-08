import express from 'express';
import { universityController } from './university.controller';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/role';
const router = express.Router();

router.get('/', universityController.getAllUniversities);

router.post('/', auth(ENUM_USER_ROLE.SUPER_ADMIN), universityController.createUniversity);

router.get('/:id', universityController.getUniversity);

router.patch('/:id', auth(ENUM_USER_ROLE.SUPER_ADMIN), universityController.updateUniversity);

export const universityRoute = router;