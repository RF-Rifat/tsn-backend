import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/role';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/ValidateRequest';
import { AdminController } from './admin/admin.controller';
import { AuthController } from './auth.controller';
import { authValidationSchema } from './auth.validation';
import { companyController } from './company/company.controller';
import { userController } from './user/user.controller';

const router = express.Router();

router.post(
  '/login',
  validateRequest(authValidationSchema.userLoginZodSchema),
  AuthController.userLogin,
);

// admin
router.post('/register/admin', AdminController.adminRegistration);
// company registration
router.post('/register/company', companyController.companyRegistration);

// User Registration
router.post('/register/user', userController.userRegistration);

// verifiy email
router.patch(
  '/verify-email',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.COMPANY,
  ),
  AuthController.verifyEmail,
);

router.post(
  '/get-new-accessToken',
  validateRequest(authValidationSchema.refreshTokenZodSchema),
  AuthController.getNewAccessToken,
);

router.patch(
  '/change-password',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.COMPANY,
  ),
  AuthController.changePassword,
);

router.patch(
  '/change-email',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.COMPANY,
  ),
  AuthController.changeEmail,
);

router.post('/forgot-password', AuthController.forgetPassword);

router.patch('/reset-password', AuthController.resetPassword);

router.post(
  '/verification-email',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.COMPANY,
  ),
  AuthController.sendVerificationEmail,
);

export const AuthRoutes = router;
