import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../../config';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { ILoginUserResponse } from '../auth.interface';
import { userService } from './user.service';

// borrower registration with login
const userRegistration = catchAsync(async (req: Request, res: Response) => {
  const { ...signUpdata } = req.body;

  const result = await userService.userRegistration(signUpdata);

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
    message: 'User Registration successfully !',
    data: responseData,
  });
});

export const userController = {
  userRegistration,
};
