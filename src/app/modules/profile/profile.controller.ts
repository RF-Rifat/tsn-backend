import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../../shared/catchAsync';
import { ICompanyProfile } from './companyProfile/company.interface';
import { IJobSeekerProfile } from './jobSeekerProfile/jobSeeker.interface';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { profileService } from './profile.service';
import { Request, Response } from 'express';

// get Company Specific Profile
const getProfileByUserId = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await profileService.getProfileByUserId(user);

  sendResponse<ICompanyProfile | IJobSeekerProfile>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile Fetched  Successfully !',
    data: result,
  });
});

const getSpecificProfileByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await profileService.getSpecificUserProfileByAdmin(
      id as string,
    );

    sendResponse<ICompanyProfile | IJobSeekerProfile>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Profile Fetched  Successfully !',
      data: result,
    });
  },
);

export const profileController = {
  getProfileByUserId,
  getSpecificProfileByAdmin,
};
