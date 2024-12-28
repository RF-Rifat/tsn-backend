/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { paginationFields } from '../../../../constant/pagination';
import ApiError from '../../../../errors/ApiError';
import { IUploadFile } from '../../../../interfaces/file';
import catchAsync from '../../../../shared/catchAsync';
import pick from '../../../../shared/pick';
import sendResponse, {
  IApiResponse,
  IGenericResponse,
} from '../../../../shared/sendResponse';
import { userFilterableFields } from './user.constant';
import { IUserProfile, UserFilterableFields } from './user.interface';
import { userServiceProfile } from './user.service';

//  create User profile By user data
const createUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const payload = req.body.data;
  const imgFile = req.file as IUploadFile;

  let data;

  if (payload) {
    data = JSON.parse(payload);
  } else if (!imgFile && !payload) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'data not found ');
  }

  const result = await userServiceProfile.createUserProfile(
    data,
    imgFile,
    user,
  );

  sendResponse<IUserProfile>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User Profile Created Successfully !',
    data: result,
  });
});

// update User profile By admin
const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  const profileId = req.params.id;
  const payload = req.body.data;
  const imgFile = req.file as IUploadFile;

  let data;

  if (payload) {
    data = JSON.parse(payload);
  } else if (!imgFile && !payload) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'updated data not found ');
  }

  const result = await userServiceProfile.updateUserProfile(
    profileId,
    data,
    imgFile,
  );

  sendResponse<IUserProfile>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Profile updated  Successfully !',
    data: result,
  });
});

// update user profile by admin
const updateUserProfileStatusByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const profileId = req.params.id;
    const payload = req.body;

    const result = await userServiceProfile.updateUserProfileByadmin(
      profileId,
      payload,
    );

    sendResponse<IUserProfile>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'User Profile updated Successfully!',
      data: result,
    });
  },
);

const verifyUserProfile = catchAsync(async (req: Request, res: Response) => {
  const profileId = req.params.id;

  const files = req.files as { [fieldName: string]: Express.Multer.File[] };

  const flattenedFiles = Object.entries(files).reduce(
    (acc, [fieldName, fieldFiles]) => {
      return [...acc, ...fieldFiles.map(file => ({ ...file, fieldName }))];
    },
    [] as IUploadFile[],
  );

  // Assuming the payload is coming from the request body
  const payload: Partial<IUserProfile> = JSON.parse(req.body.data);

  const result = await userServiceProfile.verifyUserNid(
    profileId,
    payload,
    flattenedFiles,
  );

  // Send the result back in the response
  sendResponse<IUserProfile>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      'Your document has been successfully uploaded. Our admin team will review your submission, and the process typically takes 1-2 business days.',
    data: result,
  });
});

// get all unverified User profile By admin
const getAllUnverifiedUserProfileByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const paginationOption = pick(req.query, paginationFields);
    const result =
      await userServiceProfile.getAllUnverifiedUserProfile(paginationOption);

    // console.log(result);
    sendResponse<IApiResponse<IGenericResponse<IUserProfile[]>> | any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User Profile Fetched Successfully!',
      meta: result?.meta,
      data: result?.data,
    });
  },
);
// get all unverified user profile By admin
const getAllReadyUserProfile = catchAsync(
  async (req: Request, res: Response) => {
    const paginationOption = pick(req.query, paginationFields);
    const filters = pick(req.query, userFilterableFields);
    console.log(filters);
    const result = await userServiceProfile.getAllReadyProfile(
      filters as UserFilterableFields,
      paginationOption,
    );

    // console.log(result);
    sendResponse<IApiResponse<IGenericResponse<IUserProfile[]>> | any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'UserProfile Profile Fetched Successfully!',
      meta: result?.meta,
      data: result?.data,
    });
  },
);

export const UserProfileController = {
  createUserProfile,
  updateUserProfile,
  updateUserProfileStatusByAdmin,
  verifyUserProfile,
  getAllUnverifiedUserProfileByAdmin,
  getAllReadyUserProfile,
};
