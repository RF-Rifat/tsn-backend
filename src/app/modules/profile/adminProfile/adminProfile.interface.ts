import { Types } from 'mongoose';
import { IUser } from '../../user/user.interface';

export type IAdminProfile = {
  user: Types.ObjectId | IUser;
  photo: string;
  contactNo: string;
};
