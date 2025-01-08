import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { SortOrder, startSession, Types } from 'mongoose';
import ApiError from '../../../../errors/ApiError';
import { FileUploadHelper } from '../../../../helper/FileUploadHelper';
import { buildSortConditions } from '../../../../helper/filterHelper';
import { paginationHelpers } from '../../../../helper/paginationHelper';
import { IUploadFile } from '../../../../interfaces/file';
import { IPaginationOptions } from '../../../../interfaces/pagination';
import { IGenericResponse } from '../../../../shared/sendResponse';
import { User } from '../../user/user.model';
import { userSearchableFields } from './user.constant';
import { IUserProfile, UserFilterableFields } from './user.interface';
import { UserProfile } from './user.model';

const createUserProfile = async (
  payload: IUserProfile,
  photoFile: IUploadFile | null,
  user: JwtPayload,
): Promise<IUserProfile | null> => {
  let uploadedPhotoUrl: string | null = null;
  const session = await startSession();
  session.startTransaction();

  try {
    // 1. Check if profile already exists for the user
    const existingProfile = await UserProfile.findOne({
      user: user.userId,
    });
    if (existingProfile) {
      throw new ApiError(httpStatus.CONFLICT, 'Profile already exists');
    }

    // 2. Update the user's profile creation status
    await User.findByIdAndUpdate(
      user.userId,
      { isProfileCreated: true },
      { session },
    );

    // 3. Sanitize incoming payload to remove unwanted fields
    const sanitizePayload = (data: IUserProfile): IUserProfile => {
      const { ...sanitizedData } = data;
      return sanitizedData as IUserProfile;
    };
    const sanitizedPayload = sanitizePayload(payload);

    // 4. Upload photo if provided and attach it to the sanitized payload
    const uploadPhoto = async (file: IUploadFile): Promise<string> => {
      const url = await FileUploadHelper.uploadSingleToCloudinary(file);
      if (!url)
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'Photo upload failed',
        );
      return url;
    };

    if (photoFile) {
      uploadedPhotoUrl = await uploadPhoto(photoFile);
      sanitizedPayload.photo = uploadedPhotoUrl;
    }

    // 5. Create the User profile and link it to the user
    sanitizedPayload.user = user.userId as unknown as Types.ObjectId;
    const createdProfile = await UserProfile.create([sanitizedPayload], {
      session,
    });

    // 6. Populate the newly created profile
    const populatedProfile = await UserProfile.findById(createdProfile[0]._id)
      .populate('user')
      .session(session);

    // 7. Commit transaction
    await session.commitTransaction();
    session.endSession();

    return populatedProfile;
  } catch (error) {
    // Rollback transaction
    try {
      await session.abortTransaction();
    } catch (abortError) {
      console.error('Failed to abort transaction:', abortError);
    }
    session.endSession();

    // Delete uploaded photo if it exists
    if (uploadedPhotoUrl) {
      try {
        await FileUploadHelper.deleteImageByUrl(uploadedPhotoUrl);
      } catch (deleteError) {
        console.error('Failed to delete photo after rollback:', deleteError);
      }
    }

    throw error;
  }
};

// update user Profile
const updateUserProfile = async (
  profileId: string,
  payload?: Partial<IUserProfile>,
  photoFile?: IUploadFile | null,
): Promise<IUserProfile | null> => {
  let uploadedPhotoUrl: string | null = null;

  // Upload photo to Cloudinary
  const uploadPhoto = async (file: IUploadFile) => {
    const url = await FileUploadHelper.uploadSingleToCloudinary(file);
    return url || null;
  };

  // Remove restricted fields
  const sanitizePayload = (data: any) => {
    const sanitizedData = { ...data };
    delete sanitizedData.profileStatus;
    delete sanitizedData.isVerified;
    return sanitizedData;
  };

  try {
    // Step 1: Check if the profile exists
    const profile = await UserProfile.findById(profileId);
    if (!profile) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User Profile Not Found');
    }

    // Step 2: Initialize updated data
    const updatedData: Partial<IUserProfile> = { ...payload };

    // Step 3: Handle photo upload if provided
    if (photoFile) {
      uploadedPhotoUrl = await uploadPhoto(photoFile);
      if (uploadedPhotoUrl) {
        updatedData.photo = uploadedPhotoUrl;
      }
    }

    // Step 4: Sanitize payload to remove restricted fields
    const sanitizedData = sanitizePayload(updatedData);

    // Step 5: Update the user profile
    const updatedProfile = await UserProfile.findByIdAndUpdate(
      profileId,
      sanitizedData,
      { new: true },
    );

    return updatedProfile as IUserProfile;
  } catch (error) {
    // Step 6: Rollback photo upload if an error occurs
    if (photoFile && uploadedPhotoUrl) {
      await FileUploadHelper.deleteImageByUrl(uploadedPhotoUrl);
    }
    throw error;
  }
};

// for admin shown user profile
const getAllUnverifiedUserProfile = async (
  paginationOptions: IPaginationOptions,
): Promise<IGenericResponse<IUserProfile[]>> => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  // Define filterable fields
  const queryConditions: any = {
    isVerified: false,
    profileStatus: 'pending',
    'nationalIdProofs.front': { $exists: true, $ne: null },
    'nationalIdProofs.back': { $exists: true, $ne: null },
    'nationalIdProofs.selfieWithIDPhoto': { $exists: true, $ne: null },
    'nationalIdProofs.nationalNIdNo': { $exists: true, $ne: null },
  };

  // Build sort conditions
  const sortCondition = buildSortConditions(sortBy, sortOrder);

  // Fetch paginated and sorted unverified user profiles
  const unverifiedUser = await UserProfile.find(queryConditions)
    .populate('user') // Populate related user information
    .sort(sortCondition)
    .skip(skip)
    .limit(limit)
    .lean();

  // Count total documents for pagination meta
  const total = await UserProfile.countDocuments(queryConditions);

  // Return the response in a structured format
  return {
    data: unverifiedUser,
    meta: {
      total,
      page,
      limit,
    },
  };
};

const updateUserProfileByAdmin = async (
  profileId: string,
  payload: Partial<IUserProfile>,
) => {
  // Check if the User profile exists
  const isExistedUserProfile = await UserProfile.findById(profileId);
  if (!isExistedUserProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User profile not found');
  }

  // Prepare the update data
  const updateData: Partial<IUserProfile | any> = { ...payload };

  // If the admin sends profileStatus: "ready", set isVerified to true
  if (payload.profileStatus === 'ready') {
    updateData.isVerified = true;
  }

  // Update the user profile with the prepared data
  return await UserProfile.findByIdAndUpdate(profileId, updateData, {
    new: true,
  });
};

// user Nid verification
const verifyUserNid = async (
  profileId: string,
  payload: Partial<IUserProfile | any>,
  files: IUploadFile[],
) => {
  if (!payload?.nationalNIdNo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'nationalNIdNo is required');
  }

  if (!payload.dateOfBirth) {
    throw new ApiError(httpStatus.NOT_FOUND, 'dateOfBirth  is required');
  }

  // Declare the variables outside the try block
  let uploadedPhotoUrl: string | null = null;
  let uploadedNidFrontUrl: string | null = null;
  let uploadedNidBackUrl: string | null = null;
  let uploadedNidWithSelfieUrl: string | null = null;

  // Use .find() to get the specific file for each type
  const photoFile = files.find(file => file.fieldname === 'photo');
  const nidFrontFile = files.find(file => file.fieldname === 'nidFront');
  const nidBackFile = files.find(file => file.fieldname === 'nidBack');
  const nidWithSelfieFile = files.find(
    file => file.fieldname === 'nidWithSelfie',
  );

  try {
    // Step 1: Check if the user profile exists
    const isExistedUserProfile = await UserProfile.findById(profileId);
    if (!isExistedUserProfile) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User profile not found');
    }

    // Step 2: Sanitize the payload to ensure only relevant fields are updated
    const sanitizedPayload: Partial<IUserProfile | any> = { ...payload };

    // Remove any unwanted fields from the payload
    delete sanitizedPayload.profileStatus;
    delete sanitizedPayload.isVerified;

    // Step 3: Upload NID images to Cloudinary if files are provided
    if (photoFile) {
      uploadedPhotoUrl =
        await FileUploadHelper.uploadSingleToCloudinary(photoFile);
    }

    if (nidFrontFile) {
      uploadedNidFrontUrl =
        await FileUploadHelper.uploadSingleToCloudinary(nidFrontFile);
    }

    if (nidBackFile) {
      uploadedNidBackUrl =
        await FileUploadHelper.uploadSingleToCloudinary(nidBackFile);
    }

    if (nidWithSelfieFile) {
      uploadedNidWithSelfieUrl =
        await FileUploadHelper.uploadSingleToCloudinary(nidWithSelfieFile);
    }

    // Step 4: Add uploaded NID image URLs to the profile's documentsAndLinks
    const updatedProfileData = {
      ...sanitizedPayload,
      photo: uploadedPhotoUrl || isExistedUserProfile?.photo,

      nationalIdProofs: {
        front: uploadedNidFrontUrl,
        back: uploadedNidBackUrl,
        selfieWithIDPhoto: uploadedNidWithSelfieUrl,
        nationalNIdNo: sanitizedPayload.nationalNIdNo,
      },
    };

    // Step 5: Update the User profile with the new data
    const updatedProfile = await UserProfile.findByIdAndUpdate(
      profileId,
      updatedProfileData,
      { new: true },
    );

    return updatedProfile;
  } catch (error) {
    // Rollback file uploads if there's an error during profile update
    if (uploadedPhotoUrl) {
      await FileUploadHelper.deleteImageByUrl(uploadedPhotoUrl);
    }
    if (uploadedNidFrontUrl) {
      await FileUploadHelper.deleteImageByUrl(uploadedNidFrontUrl);
    }
    if (uploadedNidBackUrl) {
      await FileUploadHelper.deleteImageByUrl(uploadedNidBackUrl);
    }
    if (uploadedNidWithSelfieUrl) {
      await FileUploadHelper.deleteImageByUrl(uploadedNidWithSelfieUrl);
    }

    // Throw the error to be handled by the calling function
    throw error;
  }
};

// // get All Ready Job
const getAllReadyProfile = async (
  filters: UserFilterableFields,
  paginationOptions: IPaginationOptions,
): Promise<IGenericResponse<IUserProfile[]> | null> => {
  // Extract searchTerm to implement search query
  const { searchTerm, skills, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions: Record<string, any>[] = [];

  // **1️⃣ Search Logic (for 'searchTerm')**
  if (searchTerm) {
    andConditions.push({
      $or: userSearchableFields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      })),
    });
  }

  // **2️⃣ Filter Logic for Fields (including skills and isVerified)**
  Object.entries(filtersData).forEach(([field, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // For skills (array), use $in to match at least one skill
      if (field === 'skills' && Array.isArray(value)) {
        andConditions.push({ skills: { $in: value } }); // Matches any of the skills
      }
      // For other fields, use direct matching
      else {
        andConditions.push({ [field]: value });
      }
    }
  });

  // **3️⃣ Handle 'skills' Filter (if it's passed separately)**
  if (skills && Array.isArray(skills) && skills.length > 0) {
    andConditions.push({ skills: { $all: skills } }); // Matches all of the skills
  }

  // **4️⃣ Filter for isVerified=true** (since "ready" implies verified)
  andConditions.push({ isVerified: true });

  // **5️⃣ Sort Logic**
  const sortConditions: { [key: string]: SortOrder } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  // **6️⃣ Combine All Conditions into a Single Query**
  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  // **7️⃣ Execute Query**
  const result = await UserProfile.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    .populate('user');
  const total = await UserProfile.countDocuments(whereConditions);

  // **8️⃣ Return Paginated Response**
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const userServiceProfile = {
  createUserProfile,
  updateUserProfile,
  verifyUserNid,
  getAllUnverifiedUserProfile,
  updateUserProfileByAdmin,
  getAllReadyProfile,
};
