import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../../config';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { ILoginUserResponse } from '../auth.interface';
import { jobSeekerService } from './job-seeker.service';

// borrower registration with login
const jobSeekerRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const { ...signUpdata } = req.body;

    const result = await jobSeekerService.jobSeekerRegistration(signUpdata);

    const { refreshToken, accessToken, data } = result;
    const responseData = { accessToken, data };
    // set refresh token into cookie
    const cookieOptions = {
      secure: config.env === 'production',
      httpOnly: true,
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);

    sendResponse<ILoginUserResponse>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Job Seeker Registration successfully !',
      data: responseData,
    });
  },
);

export const jobSeekerController = {
  jobSeekerRegistration,
};
