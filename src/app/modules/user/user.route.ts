import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/role';
import { UserController } from './user.controller';
import { FileUploadHelper } from '../../../helper/FileUploadHelper';

const router = express.Router();

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.getAllUser,
);

router.get('/:id', auth(ENUM_USER_ROLE.ADMIN), UserController.getOneUser);
router.post('/', auth(ENUM_USER_ROLE.ADMIN), UserController.createUser);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  FileUploadHelper.upload.single('file'),
  UserController.updateUser,
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  UserController.deleteUserByAdmin,
);

export const UserRoutes = router;
