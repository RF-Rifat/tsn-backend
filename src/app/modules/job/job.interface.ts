import { Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { jobsFilterableFields } from './job.constant';

export type IJobPost = {
  user: Types.ObjectId | IUser;
  jobTitle: string;
  employmentType: 'part-time' | 'full-time';
  status: 'pending' | 'ready' | 'rejected' | 'hired';
  industry: string;
  subIndustry: string;
  category: string;
  subCategory: string;
  skillsRequired: string[];
  keyword: string[];
  description: string;
  requirements?: string[];
  benefits?: string[];
  responsibilities: string[];
  wagesOrSalary: number;
  workingHoursPerDay: number;
  email?: string;
  notificationsType: {
    dailySummary: boolean;
    immediate: boolean;
    none: boolean;
  };
};

export type IJobsFilterableFields = {
  // eslint-disable-next-line no-unused-vars
  [key in (typeof jobsFilterableFields)[number]]: string;
};
