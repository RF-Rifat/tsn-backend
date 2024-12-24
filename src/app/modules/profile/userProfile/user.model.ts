import { Schema, model } from 'mongoose';
import { IUserProfile } from './user.interface';

const UserProfileSchema = new Schema<IUserProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bio: {
      type: String,
    },
    photo: {
      type: String,
    },
    keywords: {
      type: [String],
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
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
    skills: {
      type: [String],
      required: true,
    },
    nationality: {
      type: String,
      required: true,
    },
    contactNo: {
      type: String,
      required: true,
    },
    address: {
      country: { type: String, required: true },
      stateOrCity: { type: String, required: true },
      zipCode: { type: String, required: true },
      fullAddress: { type: String, required: true },
    },
    profileStatus: {
      type: String,
      enum: ['ready', 'pending', 'rejected', 'hired'],
      default: 'pending',
    },
    jobTitle: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior', 'Expert'],
    },
    homeCurrency: {
      type: String,
    },
    timezone: {
      type: String,
    },
    availableHours: {
      type: String,
    },
    hourlyPayInUSD: {
      type: String,
    },
    yearsOfExperience: {
      type: String,
    },
    locationPreference: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      required: true,
    },
    lookingFor: {
      type: String,
      enum: ['partTime', 'fullTime'],
    },
    isVerified: { type: Boolean, default: false },
    nationalIdProofs: {
      front: { type: String, required: false },
      back: { type: String, required: false },
      selfieWithIDPhoto: { type: String, required: false },
      nationalNIdNo: {
        type: String,
        required: false,
      },
    },
    education: {
      educationLevel: { type: String },
      fieldOfStudy: { type: String },
      graduationYear: { type: String },
    },
    workExperience: {
      hasExperience: { type: Boolean },
      experiences: [
        {
          companyName: { type: String, required: true },
          role: { type: String, required: true },
          duration: {
            start: { type: Date, required: true },
            end: { type: Date, required: true },
          },
          description: { type: String },
        },
      ],
    },
    additionalDetails: {
      languages: [
        {
          language: { type: String, required: true },
          proficiency: {
            type: String,
            enum: ['Fluent', 'Intermediate', 'Beginner'],
            required: true,
          },
        },
      ],
      lastActive: {
        type: String,
        // enum: ['1 week or less', '1 month or less', 'More than a month'],
      },
      expectedSalary: { type: Number },
    },
    documentsAndLinks: {
      resume: { type: String },
      portfolioLinks: { type: [String], default: [] },
      certifications: [
        {
          title: { type: String, required: true },
          dateAchieved: { type: String },
        },
      ],
      socialMediaLinks: [
        {
          platform: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],
    },
    profileCompletionPercentage: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export const UserProfile = model<IUserProfile>(
  'UserProfile',
  UserProfileSchema,
);
