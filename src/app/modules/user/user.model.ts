import { Schema, model, Document } from 'mongoose';
import { IUser, UserModel } from './user.interface';
import bcrypt from 'bcrypt';
import { convertHashPassword } from '../../../helper/passwordSecurityHelper';
import { userRole } from './user.constant';

// Extend Document to include IUser
type IUserDocument = IUser & Document;

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: userRole,
      required: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isProfileCreated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

// Pre-save middleware to hash the password before saving
UserSchema.pre<IUserDocument>('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await convertHashPassword(this.password);
  }
  next();
});

// Pre-save middleware to generate userId if not provided
UserSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.userId) {
    // Use the model directly to find the last user
    const lastUser = await (this.constructor as UserModel)
      .findOne()
      .sort({ userId: -1 })
      .select('userId')
      .lean();

    if (lastUser && lastUser.userId) {
      // Increment the numeric part of the userId and pad with leading zeros
      const nextUserId = String(parseInt(lastUser.userId, 10) + 1).padStart(
        5,
        '0',
      );
      this.userId = nextUserId;
    } else {
      // Set the first userId if no users exist
      this.userId = '00001';
    }
  }
  next();
});

// Static method to check if a user exists by email
UserSchema.statics.isUserExist = async function (
  email: string,
): Promise<IUser | null> {
  return await this.findOne(
    { email: email },
    {
      _id: 1,
      password: 1,
      name: 1,
      role: 1,
      email: 1,
      membership: 1,
      isEmailVerified: 1,
    },
  );
};

// Static method to compare passwords
UserSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

export const User = model<IUser, UserModel>('User', UserSchema);
