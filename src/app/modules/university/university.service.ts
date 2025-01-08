import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { UniversityData } from './university.interface';
import { University } from './university.model';

// create new university
const createUniversity = async (
  data: UniversityData,
): Promise<UniversityData> => {
  const result = await University.create(data);
  return result;
};

// get all universities
const getAllUniversities = async (): Promise<UniversityData[]> => {
  const result = await University.find();
  return result;
};

// get single university
const getUniversity = async (id: string): Promise<UniversityData | null> => {
  const result = await University.findById(id);
  return result;
};

// update university
const updateUniversity = async (
  data: UniversityData,
  user: JwtPayload,
  id: string,
): Promise<UniversityData | null> => {
  const isUniversityExisted = await University.findById(id).lean();
  if (!isUniversityExisted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'University does not exist');
  }
  if (user.role !== 'super-admin') {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'You are not authorized to update this university',
    );
  }
  const result = await University.findByIdAndUpdate(id, data);
  return result;
};

export const universityService = {
  createUniversity,
  getAllUniversities,
  getUniversity,
  updateUniversity,
};
