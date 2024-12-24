/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helper/jwtHelpers';
import {
  convertHashPassword,
  verifyPassword,
} from '../../../helper/passwordSecurityHelper';
import { sendMailerHelper } from '../../../helper/sendMailHelper';

import { AdminProfile } from '../profile/adminProfile/adminProfile.model';
import { ICompanyProfile } from '../profile/companyProfile/company.interface';
import { CompanyProfile } from '../profile/companyProfile/company.model';
import { IUserProfile } from '../profile/userProfile/user.interface';
import { UserProfile } from '../profile/userProfile/user.model';
import { IUser } from '../user/user.interface';
import { User } from '../user/user.model';
import {
  IAuthMessage,
  IChangeEmail,
  IChangePassword,
  IForgetPassword,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
  IResetPassword,
} from './auth.interface';
import { getOTP, verifyOtp } from './auth.util';

// login user
const userLogin = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  // Check if the user exists
  const isUserExist = await User.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Invalid credentials. Please verify your email and password . try again.',
    );
  }

  // Match the password
  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Invalid credentials. Please check your email and password . try again.',
    );
  }

  // Destructure user details
  const {
    _id,
    role,
    email: Email,
    name,
    membership,
    isEmailVerified,
  } = isUserExist;

  const user = await User.findById(_id);
  // console.log(user)
  let profile;
  if (role == 'company') {
    profile = await CompanyProfile.findOne({ user: _id }).populate('user');
  } else if (role == 'user') {
    profile = await UserProfile.findOne({ user: _id }).populate('user');
  } else if (role === 'admin' || role === 'super-admin') {
    profile = await AdminProfile.findOne({ user: _id }).populate('user');
  }
  const userCredential = profile ? profile : { user: user };
  // console

  const accessTokenPayload: Record<string, any> = {
    userId: _id,
    name: name,
    role: role,
    email: Email,
    membership: membership,
    isEmailVerified: isEmailVerified,
  };

  // Create accessToken
  const accessToken = jwtHelpers.createToken(
    accessTokenPayload,
    config.jwt.accessTokenSecret as Secret,
    config.jwt.accessTokenExpireIn as string,
  );

  // Create refreshToken payload
  const refreshTokenPayload: Record<string, any> = {
    userId: _id,
    role: role,
    email: Email,
  };

  // Conditionally add accountType if role is 'customer'

  // Create refreshToken
  const refreshToken = jwtHelpers.createToken(
    refreshTokenPayload,
    config.jwt.refreshTokenSecret as Secret,
    config.jwt.refreshTokenExpireIn as string,
  );
  // console.log(userCredential);

  return {
    accessToken,
    refreshToken,
    data: {
      profile: userCredential as Partial<IUserProfile | ICompanyProfile>,
    },
  };
};

// refresh Token
const getNewAccessToken = async (
  token: string,
): Promise<IRefreshTokenResponse> => {
  //verify token
  // invalid token - synchronous
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refreshTokenSecret as Secret,
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }

  const { email: Email } = verifiedToken;

  const isUserExist = await User.isUserExist(Email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }
  //generate new token

  const newAccessToken = jwtHelpers.createToken(
    {
      userId: isUserExist._id,
      role: isUserExist.role,
      email: isUserExist.email,
    },
    config.jwt.accessTokenSecret as Secret,
    config.jwt.accessTokenExpireIn as string,
  );

  return {
    accessToken: newAccessToken,
  };
};

// Change Password
const changePassword = async (
  user: JwtPayload | null,
  payload: IChangePassword,
): Promise<IAuthMessage> => {
  const { oldPassword, newPassword } = payload;

  // Find the user by ID and include the password field
  const isUserExist = await User.isUserExist(user?.email);

  if (!isUserExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'The account associated with this email address does not exist.',
    );
  }

  // Check if the old password matches
  const isCorrectPassword = await verifyPassword(
    oldPassword,
    isUserExist.password,
  );

  if (!isCorrectPassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'The current password you entered is incorrect. Please check and try again.',
    );
  }

  const hashedNewPassword = await convertHashPassword(newPassword);

  // Update the user's password
  await User.findByIdAndUpdate(isUserExist?._id, {
    password: hashedNewPassword,
  });

  return { message: 'Your password has been updated successfully.' };
};

// Change email
const changeEmail = async (
  user: JwtPayload | null,
  payload: IChangeEmail,
): Promise<IUser | null> => {
  const { newEmail, password } = payload;

  // Fetch the user by email and include the password field
  const existingUser = await User.isUserExist(user?.email);
  if (!existingUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Unable to process the request. Please try again later.',
    );
  }

  if (user?.email === newEmail) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'The new email address cannot be the same as the current one. Please use a different email.',
    );
  }

  // Check if the email is already in use
  const isEmailExisted = await User.isUserExist(newEmail);
  if (isEmailExisted) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Unable to process the request. Please try again later.',
    );
  }

  // Verify if the provided password matches the existing user's password
  const isPasswordValid = await verifyPassword(password, existingUser.password);
  if (!isPasswordValid) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Invalid credentials. Please verify your password and try again.',
    );
  }

  // Update the user's email and reset the email verification status
  const updatedUser = await User.findByIdAndUpdate(
    { _id: existingUser._id },
    { email: newEmail, isEmailVerified: false },
    { new: true },
  );

  // Send verification email to the new email address
  await sendVerificationEmail({
    name: updatedUser?.name,
    email: updatedUser?.email,
  });

  return updatedUser;
};

const sendVerificationEmail = async (payload: any): Promise<IAuthMessage> => {
  const { email } = payload;

  // Check if the user exists
  const isUserExist = await User.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user does not exist');
  }

  // Generate OTP
  const otp = await getOTP(email);

  const currentYear = new Date().getFullYear();

  // Email content
  const mailInfo = {
    to: email,
    subject: 'Secure Your Account: Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email Address</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #fff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                  text-align: center;
                  margin-bottom: 20px;
              }
              .header img {
                  max-width: 150px;
              }
              .content {
                  line-height: 1.8;
                  color: #333;
              }
              .content h2 {
                  color: #007bff;
              }
              .otp-code {
                  text-align: center;
                  margin: 20px 0;
                  font-size: 24px;
                  font-weight: bold;
                  color: #007bff;
              }
              .footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #777;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://yourdomain.com/logo.png" alt="Your Logo">
              </div>
              <div class="content">
                  <h2>Verify Your Email Address</h2>
                  <p>Hi ${isUserExist?.name || 'there'},</p>
                  <p>We received a request to verify your email address. To complete the process, please use the OTP code below:</p>
                  <div class="otp-code">${otp?.otp}</div>
                  <p>If you did not request this, please ignore this email. The code will expire in 5 minutes.</p>
                  <p>Thank you for choosing tsn-backend!</p>
              </div>
              <div class="footer">
                  &copy; ${currentYear} tsn-backend. All rights reserved.
              </div>
          </div>
      </body>
      </html>
      `,
  };

  // Send the email
  await sendMailerHelper.sendMail(mailInfo);
  return { message: 'OTP sent to your email. Please check your inbox.' };
};

// Reset Password
const verifyEmail = async (payload: any): Promise<any> => {
  const isUserExist = await User.isUserExist(payload.email);
  if (!isUserExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Sorry something is wrong. Please try again',
    );
  }

  await verifyOtp(payload.email, payload.otp);

  if (isUserExist?.isEmailVerified as any) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'your email is already verified',
    );
  }

  // Update the user's password
  const updatedUser = await User.findByIdAndUpdate(
    { _id: payload.userId },
    { isEmailVerified: true },
    { new: true },
  );

  const { _id, role, email: Email, name, membership } = isUserExist;

  const accessTokenPayload: Record<string, any> = {
    userId: _id,
    name: name,
    role: role,
    email: Email,
    membership: membership,
    isEmailVerified: updatedUser?.isEmailVerified,
  };

  const accessToken = jwtHelpers.createToken(
    accessTokenPayload,
    config.jwt.accessTokenSecret as Secret,
    config.jwt.accessTokenExpireIn as string,
  );

  return {
    accessToken: accessToken,
    user: updatedUser,
  };
};

// ForgetPassword
const forgetPassword = async (
  payload: IForgetPassword,
): Promise<IAuthMessage> => {
  const { email } = payload;

  // Check if the user exists
  const isUserExist = await User.findOne({ email: email });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'This user does not exist.');
  }

  const name = isUserExist.name;
  const otp = await getOTP(email);

  // Email content
  const mailInfo = {
    to: email,
    subject: 'Secure Your Account: Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Verification</title>
          <style>
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 40px auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
              }
              .header {
                  background-color: #4CAF50;
                  color: white;
                  text-align: center;
                  padding: 20px;
              }
              .header h2 {
                  margin: 0;
              }
              .content {
                  padding: 30px;
                  color: #333;
                  line-height: 1.6;
              }
              .content p {
                  margin: 16px 0;
              }
              .otp-box {
                  display: flex;
                  justify-content: center;
                  background-color: #f7f7f7;
                  border: 1px dashed #4CAF50;
                  padding: 10px 20px;
                  font-size: 18px;
                  font-weight: bold;
                  color: #4CAF50;
                  margin: 20px 0;
              }
              .footer {
                  background-color: #f1f1f1;
                  text-align: center;
                  padding: 15px;
                  font-size: 14px;
                  color: #777;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h2>Password Reset Verification</h2>
              </div>
              <div class="content">
                  <p>Hi ${name},</p>
                  <p>We received a request to reset the password for your account associated with this email.</p>
                  <p>Use the OTP below to verify your identity and reset your password:</p>
                  <div class="otp-box">${otp?.otp}</div>
                  <p>If you did not request this, please disregard this email. Your account is still secure.</p>
              </div>
              <div class="footer">
                  <p>Best regards,<br />The tsn-backend Team</p>
              </div>
          </div>
      </body>
      </html>
    `,
  };

  await sendMailerHelper.sendMail(mailInfo);

  // Return a success response
  return { message: 'Password reset email sent successfully.' };
};

// Reset Password
const resetPassword = async (
  payload: IResetPassword,
): Promise<IAuthMessage> => {
  const { newPassword, otp, email } = payload;

  const isUserExist = await User.isUserExist(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'user does not exist');
  }

  await verifyOtp(email, otp);

  const isMatchPreviousPassword = await verifyPassword(
    newPassword,
    isUserExist.password,
  );

  if (isMatchPreviousPassword) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please choose a different password.',
    );
  }

  // Hash the new password
  const hashedPassword = await convertHashPassword(newPassword);

  // Update the user's password
  await User.findOneAndUpdate({ email }, { password: hashedPassword });

  return { message: 'user password updated successfully' };
};

export const AuthService = {
  userLogin,
  changeEmail,
  getNewAccessToken,
  changePassword,
  verifyEmail,
  sendVerificationEmail,
  resetPassword,
  forgetPassword,
};
