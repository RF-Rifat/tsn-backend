import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { startSession, Types } from 'mongoose';
import ApiError from '../../../../errors/ApiError';
import { FileUploadHelper } from '../../../../helper/FileUploadHelper';
import { IUploadFile } from '../../../../interfaces/file';
import { User } from '../../user/user.model';
import { IAgentProfile } from './agent.interface';
import { AgentProfile as agentProfile } from './agent.model';

// create agent profile
const createAgentProfile = async (
  payload: IAgentProfile,
  logoFile: IUploadFile,
  user: JwtPayload,
): Promise<IAgentProfile | null> => {
  let logoUrl: string | null = null;

  // Start a transaction
  const session = await startSession();
  session.startTransaction();

  try {
    logoUrl = await FileUploadHelper.uploadSingleToCloudinary(logoFile);
    if (!logoUrl) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Logo upload failed',
      );
    }

    const withLogoUrlData = {
      ...payload,
      photo: logoUrl,
      user: user?.userId as unknown as Types.ObjectId,
    };

    await User.findByIdAndUpdate(user?.userId, {
      isProfileCreated: true,
    }).session(session);

    // Step 3: Create the agent profile in the database
    const createdProfile = await agentProfile.create([withLogoUrlData], {
      session,
    });

    const populatedProfile = await agentProfile
      .findById(createdProfile[0]._id)
      .populate('user')
      .session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return populatedProfile;
  } catch (error) {
    // Rollback the transaction
    await session.abortTransaction();
    session.endSession();

    // Rollback the uploaded logo if an error occurs
    if (logoUrl) {
      await FileUploadHelper.deleteImageByUrl(logoUrl);
    }

    throw error;
  }
};

// update agent profile
const updateAgentProfile = async (
  agentId: string,
  payload?: IAgentProfile,
  logoFile?: IUploadFile | null,
): Promise<IAgentProfile | null> => {
  let uploadedLogoUrl: any;

  try {
    const updatedData: Partial<IAgentProfile> = { ...payload };

    // If logoFile is provided, upload to Cloudinary and update the profile with the new logo URL.
    if (logoFile) {
      uploadedLogoUrl =
        await FileUploadHelper.uploadSingleToCloudinary(logoFile);
      if (uploadedLogoUrl) {
        updatedData.photo = uploadedLogoUrl;
      }
    }

    // Update the agent profile in the database and return the updated profile.
    const result = await agentProfile.findByIdAndUpdate(
      agentId,
      updatedData,
      { new: true },
    );

    return result as IAgentProfile;
  } catch (error) {
    if (logoFile && uploadedLogoUrl) {
      console.log('I am from catch in update agent profile');
      await FileUploadHelper.deleteImageByUrl(uploadedLogoUrl as string);
    }

    throw error;
  }
};

export const agentProfileService = {
  createAgentProfile,
  updateAgentProfile,
};
