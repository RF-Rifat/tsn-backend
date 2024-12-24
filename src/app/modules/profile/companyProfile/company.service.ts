import { JwtPayload } from 'jsonwebtoken';
import { FileUploadHelper } from '../../../../helper/FileUploadHelper';
import { IUploadFile } from '../../../../inerfaces/file';
import { ICompanyProfile } from './company.interface';
import { CompanyProfile } from './company.model';
import { startSession, Types } from 'mongoose';
import ApiError from '../../../../errors/ApiError';
import httpStatus from 'http-status';
import { User } from '../../user/user.model';

// create company profile
const createCompanyProfile = async (
  payload: ICompanyProfile,
  logoFile: IUploadFile,
  user: JwtPayload,
): Promise<ICompanyProfile | null> => {
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

    // Step 3: Create the company profile in the database
    const createdProfile = await CompanyProfile.create([withLogoUrlData], {
      session,
    });

    const populatedProfile = await CompanyProfile.findById(
      createdProfile[0]._id,
    )
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

// update company profile
const updateCompanyProfile = async (
  companyId: string,
  payload?: ICompanyProfile,
  logoFile?: IUploadFile | null,
): Promise<ICompanyProfile | null> => {
  let uploadedLogoUrl: any;

  try {
    const updatedData: Partial<ICompanyProfile> = { ...payload };

    // If logoFile is provided, upload to Cloudinary and update the profile with the new logo URL.
    if (logoFile) {
      uploadedLogoUrl =
        await FileUploadHelper.uploadSingleToCloudinary(logoFile);
      if (uploadedLogoUrl) {
        updatedData.photo = uploadedLogoUrl;
      }
    }

    // Update the company profile in the database and return the updated profile.
    const result = await CompanyProfile.findByIdAndUpdate(
      companyId,
      updatedData,
      { new: true },
    );

    return result as ICompanyProfile;
  } catch (error) {
    if (logoFile && uploadedLogoUrl) {
      console.log('i am from catch in update company profile ');
      await FileUploadHelper.deleteImageByUrl(uploadedLogoUrl as string);
    }

    throw error;
  }
};

export const companyProfileService = {
  createCompanyProfile,
  updateCompanyProfile,
};
