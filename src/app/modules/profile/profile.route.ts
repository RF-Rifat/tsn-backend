import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/role';
import { FileUploadHelper } from '../../../helper/FileUploadHelper';
import auth from '../../middlewares/auth';
import { companyProfileController } from './companyProfile/company.controller';
import { profileController } from './profile.controller';
import { UserProfileController } from './userProfile/user.controller';

const router = express.Router();

const companyUrl = '/company';
const userUrl = '/user';
// const admin = '/admin';

// get profile
router.get(
  '/',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.COMPANY,
  ),
  profileController.getProfileByUserId,
);

router.get(
  `${userUrl}/ready`,
  UserProfileController.getAllReadyUserProfile,
);

// company profile routes
router.post(
  `${companyUrl}`,
  auth(ENUM_USER_ROLE.COMPANY),
  FileUploadHelper.upload.single('logo'),
  companyProfileController.createCompanyProfile,
);

router.patch(
  `${companyUrl}/:id`,
  auth(ENUM_USER_ROLE.COMPANY),
  FileUploadHelper.upload.single('logo'),
  companyProfileController.updateCompanyProfile,
);

// User profile routes
router.post(
  `${userUrl}`,
  auth(ENUM_USER_ROLE.USER),
  FileUploadHelper.upload.single('photo'),
  UserProfileController.createUserProfile,
);

// User
router.patch(
  `${userUrl}/:id`,
  auth(ENUM_USER_ROLE.USER),
  FileUploadHelper.upload.single('photo'),
  UserProfileController.updateUserProfile,
);

router.patch(
  `${userUrl}/verify-nid/:id`,
  auth(ENUM_USER_ROLE.USER),
  FileUploadHelper.upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'nidFront', maxCount: 1 },
    { name: 'nidBack', maxCount: 1 },
    { name: 'nidWithSelfie', maxCount: 1 },
  ]),
  UserProfileController.verifyUserProfile,
);

// admin
router.get(
  `${userUrl}`,
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserProfileController.getAllUnverifiedUserProfileByAdmin,
);

// admin
router.get(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  profileController.getSpecificProfileByAdmin,
);

// admin
router.patch(
  `${userUrl}/verify/:id`,
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserProfileController.updateUserProfileStatusByAdmin,
);

export const profileRoute = router;
