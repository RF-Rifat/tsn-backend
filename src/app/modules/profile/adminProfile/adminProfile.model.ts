import { Schema, model, Types } from 'mongoose';
import { IAdminProfile } from './adminProfile.interface';

const AdminProfileSchema = new Schema<IAdminProfile>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    photo: {
      type: String,
    },
    contactNo: {
      type: String,
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

export const AdminProfile = model<IAdminProfile>(
  'AdminProfile',
  AdminProfileSchema,
);
