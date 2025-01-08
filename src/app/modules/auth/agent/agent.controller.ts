import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../../config';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { ILoginUserResponse } from '../auth.interface';
import { agentService } from './agent.service';

// borrower registration with login
const agentRegistration = catchAsync(async (req: Request, res: Response) => {
  const { ...signUpData } = req.body;

  const result = await agentService.agentRegistration(signUpData);

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
    message: 'Agent Registration successfully !',
    data: responseData,
  });
});

export const agentController = {
  agentRegistration,
};
