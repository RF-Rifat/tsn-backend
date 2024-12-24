import { JwtPayload } from 'jsonwebtoken';
import { IAdminProfile } from './adminProfile/adminProfile.interface';
import { AdminProfile } from './adminProfile/adminProfile.model';
import { ICompanyProfile } from './companyProfile/company.interface';
import { CompanyProfile } from './companyProfile/company.model';
import { IJobSeekerProfile } from './jobSeekerProfile/jobSeeker.interface';
import { JobSeekerProfile } from './jobSeekerProfile/jobSeeker.model';
import { User } from '../user/user.model';

// getProfile By user id
const getProfileByUserId = async (
  payload: JwtPayload,
): Promise<ICompanyProfile | IJobSeekerProfile | IAdminProfile | any> => {
  const { userId, role } = payload;
  const user = await User.findById(userId).lean();

  if (role == 'company') {
    const profile = await CompanyProfile.findOne({ user: userId }).populate(
      'user',
    );
    if (!profile) return { user: { ...user } };
    return profile;
  } else if (role == 'job-seeker') {
    const profile = await JobSeekerProfile.findOne({ user: userId }).populate(
      'user',
    );
    if (!profile) return { user: { ...user } };
    return profile;
  } else if (role === 'admin' || role === 'super-admin') {
    const profile = await AdminProfile.findOne({ user: userId }).populate(
      'user',
    );
    if (!profile) return { user: { ...user } };
    return profile;
  }
};

const getSpecificUserProfileByAdmin = async (
  userId: string,
): Promise<ICompanyProfile | IJobSeekerProfile | IAdminProfile | any> => {
  const isUserExist = await User.findById(userId).lean();
  if (!isUserExist) {
    throw new Error('User not found');
  }

  if (isUserExist.role == 'company') {
    const profile = await CompanyProfile.findOne({ user: userId }).populate(
      'user',
    );
    if (!profile) return { message: 'The profile has not been created yet' };
    return profile;
  } else if (isUserExist.role == 'job-seeker') {
    const profile = await JobSeekerProfile.findOne({ user: userId }).populate(
      'user',
    );
    if (!profile) return { message: 'The profile has not been created yet' };
    return profile;
  } else if (
    isUserExist.role === 'admin' ||
    isUserExist.role === 'super-admin'
  ) {
    const profile = await AdminProfile.findOne({ user: userId }).populate(
      'user',
    );
    if (!profile) return { message: 'The profile has not been created yet' };
    return profile;
  }
};

export const profileService = {
  getProfileByUserId,
  getSpecificUserProfileByAdmin,
};
