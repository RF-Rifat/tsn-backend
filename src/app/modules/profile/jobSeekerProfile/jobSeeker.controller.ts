import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../../../shared/catchAsync';
import { Request, Response, Express } from 'express';
import { IUploadFile } from '../../../../inerfaces/file';
import sendResponse, {
  IApiResponse,
  IGenericResponse,
} from '../../../../shared/sendResponse';
import {
  IJobSeekerFilterableFields,
  IJobSeekerProfile,
} from './jobSeeker.interface';
import httpStatus from 'http-status';
import { JobSeekerServiceProfile } from './jobSeeker.service';
import ApiError from '../../../../errors/ApiError';
import pick from '../../../../shared/pick';
import { paginationFields } from '../../../../constant/pagination';
import { jobSeekerFilterableFields } from './jobSeeker.constant';

//  create  job seeker profile By job seeker
const createJobSeekerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const payload = req.body.data;
    const imgFile = req.file as IUploadFile;

    let data;

    if (payload) {
      data = JSON.parse(payload);
    } else if (!imgFile && !payload) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'data not found ');
    }

    const result = await JobSeekerServiceProfile.createJobSeekerProfile(
      data,
      imgFile,
      user,
    );

    sendResponse<IJobSeekerProfile>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Job Seeker Profile Created Successfully !',
      data: result,
    });
  },
);

// update  job Seeker profile By admin
const updateJobSeekerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const profileId = req.params.id;
    const payload = req.body.data;
    const imgFile = req.file as IUploadFile;

    let data;

    if (payload) {
      data = JSON.parse(payload);
    } else if (!imgFile && !payload) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'updated data not found ');
    }

    const result = await JobSeekerServiceProfile.updateJobSeekerProfile(
      profileId,
      data,
      imgFile,
    );

    sendResponse<IJobSeekerProfile>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Job Seeker Profile updated  Successfully !',
      data: result,
    });
  },
);

// update  job Seeker profile by admin
const updateJobSeekerProfileStatusByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const profileId = req.params.id;
    const payload = req.body;

    const result = await JobSeekerServiceProfile.updateJobSeekerProfileByadmin(
      profileId,
      payload,
    );

    sendResponse<IJobSeekerProfile>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Job Seeker Profile updated Successfully!',
      data: result,
    });
  },
);

// verifiy job seeker profile by jobSeeker
const verifyJobSeekerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const profileId = req.params.id;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Flatten the files object into an array with fieldname property
    const flattenedFiles = Object.entries(files).reduce(
      (acc, [fieldname, fieldFiles]) => {
        return [...acc, ...fieldFiles.map(file => ({ ...file, fieldname }))];
      },
      [] as IUploadFile[],
    );

    // Assuming the payload is coming from the request body
    const payload: Partial<IJobSeekerProfile> = JSON.parse(req.body.data);
    // console.log('i am from controller ',payload);

    // Call the service method with the required parameters
    const result = await JobSeekerServiceProfile.verifyJobSeekerNid(
      profileId,
      payload,
      flattenedFiles,
    );

    // Send the result back in the response
    sendResponse<IJobSeekerProfile>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message:
        'Your document has been successfully uploaded. Our admin team will review your submission, and the process typically takes 1-2 business days.',
      data: result,
    });
  },
);

// get all unverified job seeker profile By admin
const getAllUnverifiedJobSeekerProfileByAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const paginationOption = pick(req.query, paginationFields);
    const result =
      await JobSeekerServiceProfile.getAllUnverifiedJobSeekerProfile(
        paginationOption,
      );

    // console.log(result);
    sendResponse<IApiResponse<IGenericResponse<IJobSeekerProfile[]>> | any>(
      res,
      {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Job Seeker Profile Fetched Successfully!',
        meta: result?.meta,
        data: result?.data,
      },
    );
  },
);
// get all unverified job seeker profile By admin
const getAllReadyJobSeekerProfile = catchAsync(
  async (req: Request, res: Response) => {
    const paginationOption = pick(req.query, paginationFields);
    const filters = pick(req.query, jobSeekerFilterableFields);
    console.log(filters);
    const result = await JobSeekerServiceProfile.getAllReadyProfile(
      filters as IJobSeekerFilterableFields,
      paginationOption,
    );

    // console.log(result);
    sendResponse<IApiResponse<IGenericResponse<IJobSeekerProfile[]>> | any>(
      res,
      {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Job Seeker Profile Fetched Successfully!',
        meta: result?.meta,
        data: result?.data,
      },
    );
  },
);

export const JobSeekerProfileController = {
  createJobSeekerProfile,
  updateJobSeekerProfile,
  updateJobSeekerProfileStatusByAdmin,
  verifyJobSeekerProfile,
  getAllUnverifiedJobSeekerProfileByAdmin,
  getAllReadyJobSeekerProfile,
};
