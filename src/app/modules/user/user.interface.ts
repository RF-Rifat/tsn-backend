/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type IUser = {
  _id?: string;
  userId: string;
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'company' | 'admin' | 'super-admin';
  membership: 'FreePlan' | 'ProPlan' | 'PremiumPlan';
  isProfileCreated: boolean;
  passwordChangedAt?: Date;
  isEmailVerified?: boolean;
  isVerified?: boolean;
};

export type IUserFilters = {
  searchTerm?: string;
  role?: string;
  email?: string;
  isEmailVerified: boolean;
  isVerified: boolean;
};

export type UserModel = {
  isUserExist(email: string): Promise<IUser>;
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string,
  ): Promise<boolean>;
} & Model<IUser>;
