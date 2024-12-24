import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/role';
import { FileUploadHelper } from '../../../helper/FileUploadHelper';
import auth from '../../middlewares/auth';
import { companyProfileController } from './companyProfile/company.controller';
import { profileController } from './profile.controller';
import { JobSeekerProfileController } from './jobSeekerProfile/jobSeeker.controller';

const router = express.Router();

const companyUrl = '/company';
const job_seekerUrl = '/job_seeker';
// const admin = '/admin';

// get profile
router.get(
  '/',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.JOB_SEEKER,
    ENUM_USER_ROLE.COMPANY,
  ),
  profileController.getProfileByUserId,
);

router.get(
  `${job_seekerUrl}/ready`,
  JobSeekerProfileController.getAllReadyJobSeekerProfile,
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

// Job Seeker profile routes
// job seeker
router.post(
  `${job_seekerUrl}`,
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  FileUploadHelper.upload.single('photo'),
  JobSeekerProfileController.createJobSeekerProfile,
);

//job seeker
router.patch(
  `${job_seekerUrl}/:id`,
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  FileUploadHelper.upload.single('photo'),
  JobSeekerProfileController.updateJobSeekerProfile,
);

router.patch(
  `${job_seekerUrl}/verify-nid/:id`,
  auth(ENUM_USER_ROLE.JOB_SEEKER),
  FileUploadHelper.upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'nidFront', maxCount: 1 },
    { name: 'nidBack', maxCount: 1 },
    { name: 'nidWithSelfie', maxCount: 1 },
  ]),
  JobSeekerProfileController.verifyJobSeekerProfile,
);

// admin
router.get(
  `${job_seekerUrl}`,
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  JobSeekerProfileController.getAllUnverifiedJobSeekerProfileByAdmin,
);

// admin
router.get(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  profileController.getSpecificProfileByAdmin,
);

// admin
router.patch(
  `${job_seekerUrl}/verify/:id`,
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  JobSeekerProfileController.updateJobSeekerProfileStatusByAdmin,
);

export const profileRoute = router;
