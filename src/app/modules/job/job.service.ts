import httpStatus from 'http-status';
import { IJobPost, IJobsFilterableFields } from './job.interface';
import { User } from '../user/user.model';
import ApiError from '../../../errors/ApiError';
import { JwtPayload } from 'jsonwebtoken';
// import { PendingJob, ReadyJob } from './job.model';
import { IPaginationOptions } from '../../../inerfaces/pagination';
import { IGenericResponse } from '../../../shared/sendResponse';
import { jobsSearchableFields } from './job.constant';
import FilterPaginationHelper from '../../../helper/filterHelper';
import { Job } from './job.model';
import { CompanyProfile } from '../profile/companyProfile/company.model';

// Create Job
const createJob = async (
  payload: IJobPost,
  user: JwtPayload,
): Promise<IJobPost | null> => {
  // console.log(payload);
  const { userId, email } = user;
  payload.user = userId;
  payload.status = 'pending';

  const isUserExisted = await User.isUserExist(email);

  const isCreatedProfile = await CompanyProfile.findOne({
    user: userId,
  });
  if (!isCreatedProfile) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Your profile has not been created yet. Please create your profile first before proceeding to create a job.',
    );
  }

  // console.log(payload);
  if (!isUserExisted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'user does not  exist');
  }

  const result = await Job.create(payload);

  return result;
};

// get All Job
const getAllReadyJob = async (
  paginationOptions: IPaginationOptions,
  filters: IJobsFilterableFields,
): Promise<IGenericResponse<IJobPost[]> | null> => {
  const filtersData = { ...filters, status: 'ready' };

  return FilterPaginationHelper.getGenericResponse<IJobPost>(
    Job,
    paginationOptions,
    filtersData,
    jobsSearchableFields,
  );
};

const getSpecificUserJob = async (user: JwtPayload): Promise<IJobPost[]> => {
  const { userId, role } = user;

  // Check if the user is an admin or super-admin
  const isAdminOrSuperAdmin = role === 'admin' || role === 'super-admin';

  if (isAdminOrSuperAdmin) {
    // Admins and super-admins can view all pending jobs
    const result = await Job.find({ status: 'pending' }).populate('user');
    console.log('Populated Result:', result);
    return result;
  }

  // Regular users can only view their own jobs
  const userJobs = await Job.find({ user: userId }).populate('user');
  // console.log('Populated User Jobs:', userJobs);
  return userJobs;
};

// update user
const updateJob = async (
  payload: Partial<IJobPost>,
  user: JwtPayload,
  jobId: string,
) => {
  // Check if the job exists
  const isJobExisted = await Job.findById(jobId).lean();
  if (!isJobExisted) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Job does not exist');
  }

  // Check if the user is authorized to update the job
  const isAdminOrSuperAdmin =
    user.role === 'admin' || user.role === 'super-admin';
  const isJobOwner = user?.userId === isJobExisted?.user?.toString();

  if (!isAdminOrSuperAdmin && !isJobOwner) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update this job',
    );
  }

  // If the user is not an admin or super-admin, prevent them from updating the status
  if (!isAdminOrSuperAdmin && payload.status) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'You are not authorized to update the job status',
    );
  }

  // Handle partial updates for `notificationsType`
  const updateQuery: any = { ...payload }; // Start with the payload

  if (payload.notificationsType) {
    updateQuery.$set = {};
    Object.entries(payload.notificationsType).forEach(([key, value]) => {
      updateQuery.$set[`notificationsType.${key}`] = value;
    });
    delete updateQuery.notificationsType;
  }

  // Perform the update
  const result = await Job.findOneAndUpdate({ _id: jobId }, updateQuery, {
    new: true,
  }).populate('user');

  return result;
};

const getSpecificJob = async (jobId: string): Promise<IJobPost | null> => {
  const result = await Job.findById(jobId).lean();
  // console.log(result);
  const profile = await CompanyProfile.findOne({ user: result?.user })
    .populate('user')
    .lean();
  // console.log(profile);
  // const profile= await
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  const allData = { company: profile, ...result };
  return allData;
};

const getSpecificCompanyJob = async (
  payload: JwtPayload,
): Promise<IJobPost[]> => {
  const result = await Job.find({ user: payload.userId })
    .populate('user')
    .lean();
  return result;
};

export const jobService = {
  createJob,
  updateJob,
  getSpecificUserJob,
  getAllReadyJob,
  getSpecificJob,
  getSpecificCompanyJob,
};
