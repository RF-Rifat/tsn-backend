import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../../errors/ApiError';
import { IUploadFile } from '../../../../inerfaces/file';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { ICompanyProfile } from './company.interface';
import { companyProfileService } from './company.service';

//  create company profile
const createCompanyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const data = JSON.parse(req.body.data);

  const logoFile = req.file as IUploadFile;
  if (!logoFile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Company logo is required');
  }

  const result = await companyProfileService.createCompanyProfile(
    data,
    logoFile,
    user,
  );

  sendResponse<ICompanyProfile>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Company Profile Created Successfully !',
    data: result,
  });
});

// update company profile
const updateCompanyProfile = catchAsync(async (req: Request, res: Response) => {
  //   const user = req.user as JwtPayload;
  const proifleId = req.params.id;
  const payload = req.body.data;
  const imgFile = req.file as IUploadFile;

  let data;
  console.log("p...", payload);
  if (payload) {
    data = JSON.parse(payload);
  } else if (!imgFile && !payload) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'updated data not found ');
  }

  const result = await companyProfileService.updateCompanyProfile(
    proifleId,
    data,
    imgFile,
  );

  sendResponse<ICompanyProfile>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Company Profile updated  Successfully !',
    data: result,
  });
});

export const companyProfileController = {
  createCompanyProfile,
  updateCompanyProfile,
};
