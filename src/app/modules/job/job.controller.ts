import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../../shared/catchAsync';
import { Request, Response } from 'express';
import { jobService } from './job.service';
import sendResponse, { IGenericResponse } from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { IJobPost, IJobsFilterableFields } from './job.interface';
import pick from '../../../shared/pick';
import { jobsFilterableFields } from './job.constant';
import { paginationFields } from '../../../constant/pagination';

//  create user profile
const createJob = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const data = req.body;

  const result = await jobService.createJob(data, user);

  sendResponse<IJobPost>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Job  Created Successfully !',
    data: result,
  });
});

// update job
const updateJob = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const payload = req.body;
  const id = req.params.id;

  const result = await jobService.updateJob(payload, user, id);

  sendResponse<IJobPost>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Job updated Successfully !',
    data: result,
  });
});

// get specific user or admin job
const getAllJobs = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, jobsFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);
  const result = await jobService.getAllReadyJob(
    paginationOptions,
    filters as IJobsFilterableFields,
  );

  sendResponse<IGenericResponse<IJobPost[]>>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Jobs fetched Successfully !',
    data: result,
  });
});

const getSpecificUserOrAdminJob = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const result = await jobService.getSpecificUserJob(user);

    sendResponse<IJobPost[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: ' Job fetched Successfully !',
      data: result,
    });
  },
);

const getSpecificJob = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await jobService.getSpecificJob(id);

  sendResponse<IJobPost>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ' Job fetched Successfully !',
    data: result,
  });
});



export const jobController = {
  createJob,
  getSpecificUserOrAdminJob,
  updateJob,
  getAllJobs,
  getSpecificJob,
};
