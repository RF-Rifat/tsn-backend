import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/role';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/ValidateRequest';
import { AdminController } from './admin/admin.controller';
import { agentController } from './agent/agent.controller';
import { AuthController } from './auth.controller';
import { authValidationSchema } from './auth.validation';
import { userController } from './user/user.controller';

const router = express.Router();

router.post(
  '/login',
  validateRequest(authValidationSchema.userLoginZodSchema),
  AuthController.userLogin,
);

// admin
router.post('/register/admin', AdminController.adminRegistration);
// agent registration
router.post('/register/agent', agentController.agentRegistration);

// User Registration
router.post('/register/user', userController.userRegistration);

// verify email
router.patch(
  '/verify-email',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.AGENT,
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
    ENUM_USER_ROLE.AGENT,
  ),
  AuthController.changePassword,
);

router.patch(
  '/change-email',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.AGENT,
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
    ENUM_USER_ROLE.AGENT,
  ),
  AuthController.sendVerificationEmail,
);

export const AuthRoutes = router;
