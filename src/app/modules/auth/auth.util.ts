import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { OTP } from './auth.model';
import { IOtp } from './auth.interface';
import crypto from 'crypto';

// get OTP
export const getOTP = async (email: string): Promise<IOtp> => {
  const otp = crypto.randomBytes(3).toString('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const otpRecord = new OTP({
    email,
    otp,
    expiresAt,
  });

  return await otpRecord.save();
};

// verifiy OTP
export const verifyOtp = async (email: string, otp: string) => {
  const otpRecord = await OTP.findOne({ email, otp });

  // Check if OTP exists and is still valid
  if (!otpRecord) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }

  // Check if OTP has expired
  if (new Date() > otpRecord.expiresAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP has expired');
  }
};
