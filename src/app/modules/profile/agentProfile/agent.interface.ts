import { Types } from 'mongoose';
import { IUser } from '../../user/user.interface';

export type IAgentProfile = {
  user: Types.ObjectId | IUser;
  photo: string;
  yearOfEstablishment: string;
  agentSize: '1-10  ' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  address: {
    country: string;
    state: string;
    zipCode: string;
    fullAddress: string;
  };
  industryType: string;
  businessDescription: string;
  timezone: string;
  homeCurrency: string;
  phone: string;
  websiteUrl: string;
  socialMediaUrls: { platform: string; url: string }[];
};
