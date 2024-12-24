import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ICompanyProfile } from './companyProfile/company.interface';
import { profileService } from './profile.service';
import { IUserProfile } from './userProfile/user.interface';

// get Company Specific Profile
const getProfileByUserId = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const result = await profileService.getProfileByUserId(user);

  sendResponse<ICompanyProfile | IUserProfile>(res, {
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

    sendResponse<ICompanyProfile | IUserProfile>(res, {
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
