import { Schema, model, Types } from 'mongoose';
import { IJobPost } from './job.interface';
// import { string } from 'zod';

const JobPostSchema = new Schema<IJobPost>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'ready', 'rejected', 'hired'],
      default: 'pending',
    },
    jobTitle: {
      type: String,
      required: true,
      trim: true,
    },
    employmentType: {
      type: String,
      enum: ['part-time', 'full-time'],
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    subIndustry: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    skillsRequired: {
      type: [String],
      required: true,
      trim: true,
    },
    keyword: {
      type: [String],
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    wagesOrSalary: {
      type: Number,
      required: true,
    },
    workingHoursPerDay: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      trim: true,
    },
    notificationsType: {
      dailySummary: {
        type: Boolean,
        required: true,
      },
      immediate: {
        type: Boolean,
        required: true,
      },
      none: {
        type: Boolean,
        required: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const Job = model<IJobPost>('job', JobPostSchema);
