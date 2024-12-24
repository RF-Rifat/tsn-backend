import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {
  IAuthMessage,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface';
import { AuthService } from './auth.service';

// userLogin
const userLogin = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;

  const result = await AuthService.userLogin(loginData);

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
    message: 'User logged in successfully!',
    data: responseData,
  });
});

// refreshToken
const getNewAccessToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthService.getNewAccessToken(refreshToken);

  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<IRefreshTokenResponse>(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully !',
    data: result,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req.body;

  const result = await AuthService.changePassword(user, passwordData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Password changed successfully !',
    data: result,
  });
});

// change password
const changeEmail = catchAsync(async (req: Request, res: Response) => {
  const user = req?.user;
  const { ...data } = req.body;

  const result = await AuthService.changeEmail(user, data);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Email changed successfully !',
    data: result,
  });
});

// ForgetPassword
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgetPassword(req.body);

  sendResponse<IAuthMessage>(res, {
    statusCode: 200,
    success: true,
    message: 'Please.Check your email!',
    data: result,
  });
});

// Reset Password
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);

  sendResponse<IAuthMessage>(res, {
    statusCode: 200,
    success: true,
    message: 'your account is  recovered!',
    data: result,
  });
});

// email verification
const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { ...data } = req.body;
  const user = req.user as JwtPayload;

  if (data?.email) {
    user.email = data.email;
  }
  const readyData = { ...data, ...user };

  const result = await AuthService.verifyEmail(readyData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Congratulation.your email has been Verified Successfully !',
    data: result,
  });
});

// send verification email
const sendVerificationEmail = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const result = await AuthService.sendVerificationEmail(user);

    sendResponse<IAuthMessage>(res, {
      statusCode: 200,
      success: true,
      message: 'Please.Check your email!',
      data: result,
    });
  },
);

export const AuthController = {
  userLogin,
  getNewAccessToken,
  sendVerificationEmail,
  verifyEmail,
  changePassword,
  forgetPassword,
  resetPassword,
  changeEmail,
};
