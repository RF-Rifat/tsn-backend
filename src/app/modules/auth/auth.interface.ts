import { IAgentProfile } from '../profile/agentProfile/agent.interface';
import { IUserProfile } from '../profile/userProfile/user.interface';

export type ILoginUser = {
  email: string;
  password: string;
};

export type ILoginUserResponse = {
  accessToken: string;
  refreshToken?: string;
  isEmailVerified?: boolean;
  data: {
    profile?: Partial<IAgentProfile | IUserProfile>;
  };
};

export type IDataValidationResponse = {
  validationResponse: {
    message?: string;
  };
};

export type IRefreshTokenResponse = {
  accessToken: string;
};

export type IChangePassword = {
  oldPassword: string;
  newPassword: string;
};

export type IChangeEmail = {
  password: string;
  newEmail: string;
};

export type IForgetPassword = {
  email: string;
};

export type IOtp = {
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
};

export type IResetPassword = {
  otp: string;
  email: string;
  newPassword: string;
};

export type IAuthMessage = {
  message: string;
};
