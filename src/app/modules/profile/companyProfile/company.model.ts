import { Schema, model, Types } from 'mongoose';
import { ICompanyProfile } from './company.interface';

const CompanyProfileSchema = new Schema<ICompanyProfile>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    yearOfEstablishment: {
      type: String,
      required: true,
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      required: true,
    },
    address: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      fullAddress: { type: String, required: false },
    },
    industryType: {
      type: String,
      required: true,
    },
    businessDescription: {
      type: String,
      required: false,
    },
    timezone: {
      type: String,
      required: true,
    },
    homeCurrency: {
      type: String,
      required: true,
    },
    phone: {
      countryCode: { type: String, required: false },
      number: { type: String, required: true },
    },
    websiteUrl: {
      type: String,
      required: false,
    },
    socialMediaUrls: {
      type: [
        {
          platform: { type: String, required: true },
          url: { type: String, required: true },
        },
      ],

      required: false,
      default: [],
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

export const CompanyProfile = model<ICompanyProfile>(
  'CompanyProfile',
  CompanyProfileSchema,
);
