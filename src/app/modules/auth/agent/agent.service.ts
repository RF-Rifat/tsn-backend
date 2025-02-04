import httpStatus from 'http-status';
import { startSession } from 'mongoose';
import ApiError from '../../../../errors/ApiError';
import { IUser } from '../../user/user.interface';
import { User } from '../../user/user.model';
import { ILoginUserResponse } from '../auth.interface';
import { AuthService } from '../auth.service';

// customer registration
const agentRegistration = async (
  payload: IUser,
): Promise<ILoginUserResponse> => {
  payload.role = 'agent';

  const isNotUniqueEmail = await User.isUserExist(payload.email);
  if (isNotUniqueEmail) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Sorry, this email address is already in use.',
    );
  }

  const session = await startSession();
  session.startTransaction();

  try {
    const user = await User.create(payload);

    await AuthService.sendVerificationEmail({
      email: user?.email,
      name: user?.name,
    });

    // Login User
    const loginData = { email: payload?.email, password: payload.password };
    const result = await AuthService.userLogin(loginData);
    return result;

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const agentService = {
  agentRegistration,
};
