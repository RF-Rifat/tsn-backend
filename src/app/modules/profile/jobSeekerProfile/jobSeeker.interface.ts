import { Types } from 'mongoose';
import { IUser } from '../../user/user.interface';
import {
  jobSeekerFilterableFields,
  jobSeekerSearchableFields,
} from './jobSeeker.constant';
export type IJobSeekerProfile = {
  user: Types.ObjectId | IUser;
  bio?: string;
  photo: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  nationality: string;
  contactNo: string;
  keywords: string[];
  address: {
    country: string;
    stateOrCity: string;
    zipCode: string;
    fullAddress: string;
  };
  industry: string;
  subIndustry: string;
  category: string;
  subCategory: string;
  skills: string[];
  jobTitle: string;
  experienceLevel?: 'Entry' | 'Mid' | 'Senior' | 'Expert';
  homeCurrency?: string;
  timezone?: string;
  availableHours: string;
  hourlyPayInUSD: string;
  yearsOfExperience?: string;
  locationPreference: 'remote' | 'onsite' | 'hybrid';
  lookingFor?: 'partTime' | 'fullTime';
  profileStatus: 'ready' | 'pending' | 'rejected' | 'hired';
  education?: {
    educationLevel?: string;
    fieldOfStudy?: string;
    graduationYear?: string;
  };
  workExperience?: {
    hasExperience?: boolean;
    experiences?: {
      companyName: string;
      role: string;
      duration: {
        start: Date;
        end: Date;
      };
      description?: string;
    }[];
  };
  additionalDetails?: {
    languages?: {
      language: string;
      proficiency: 'Fluent' | 'Intermediate' | 'Beginner';
    }[];
    lastActive?: string;

    expectedSalary?: number;
  };
  nationalIdProofs?: {
    front: string;
    back: string;
    selfieWithIDPhoto: string;
    nationalNIdNo: string;
  };
  isVerified?: boolean;
  documentsAndLinks?: {
    resume?: string;
    portfolioLinks?: string[];

    certifications?: {
      title: string;
      dateAchieved?: string;
    }[];
    socialMediaLinks?: {
      platform: string;
      url: string;
    }[];
  };
  profileCompletionPercentage?: number;
};

export type IJobSeekerFilterableFields = {
  // eslint-disable-next-line no-unused-vars
  [key in (typeof jobSeekerFilterableFields)[number]]: string;
};

export type IJobSeekerSearchableFields = {
  // eslint-disable-next-line no-unused-vars
  [key in (typeof jobSeekerSearchableFields)[number]]: string;
};
