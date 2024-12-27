import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UniversityData } from './university.interface';
import { universityService } from './university.service';

// create new university
const createUniversity = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await universityService.createUniversity(data);
  sendResponse<UniversityData>(res, {
    statusCode: 201,
    success: true,
    message: 'University created successfully',
    data: result,
  });
});

// get all universities
const getAllUniversities = catchAsync(async (req: Request, res: Response) => {
  const result = await universityService.getAllUniversities();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All universities fetched successfully',
    data: result,
  });
});
// get single university
const getUniversity = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await universityService.getUniversity(id);
  if (!result) {
    sendResponse(res, {
      statusCode: 404,
      success: false,
      message: 'University not found',
      data: null,
    });
  } else {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'University fetched successfully',
      data: result,
    });
  }
});

// update university
const updateUniversity = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const data = req.body;
  const id = req.params.id;

  const result = await universityService.updateUniversity(data, user, id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'University updated successfully',
    data: result,
  });
});
export const universityController = {
  createUniversity,
  getAllUniversities,
  getUniversity,
  updateUniversity,
};
