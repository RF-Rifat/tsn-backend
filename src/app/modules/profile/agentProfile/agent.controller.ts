import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../../errors/ApiError';
import { IUploadFile } from '../../../../interfaces/file';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { IAgentProfile } from './agent.interface';
import { agentProfileService } from './agent.service';

//  create agent profile
const createAgentProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const data = JSON.parse(req.body.data);

  const logoFile = req.file as IUploadFile;
  if (!logoFile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Agent logo is required');
  }

  const result = await agentProfileService.createAgentProfile(
    data,
    logoFile,
    user,
  );

  sendResponse<IAgentProfile>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Agent Profile Created Successfully !',
    data: result,
  });
});

// update agent profile
const updateAgentProfile = catchAsync(async (req: Request, res: Response) => {
  //   const user = req.user as JwtPayload;
  const profileId = req.params.id;
  const payload = req.body.data;
  const imgFile = req.file as IUploadFile;

  let data;
  console.log('p...', payload);
  if (payload) {
    data = JSON.parse(payload);
  } else if (!imgFile && !payload) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'updated data not found ');
  }

  const result = await agentProfileService.updateAgentProfile(
    profileId,
    data,
    imgFile,
  );

  sendResponse<IAgentProfile>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Agent Profile updated  Successfully !',
    data: result,
  });
});

export const agentProfileController = {
  createAgentProfile,
  updateAgentProfile,
};
