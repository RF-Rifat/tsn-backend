/**
 * Title: 'Manage  nessaray secret'
 * Description: 'handle or manage .env file's secret data'
 * Author: 'Masum Rana'
 * Date: 27-12-2023
 *
 */

import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  email: process.env.EMAIL,
  email_secret: process.env.EMAIL_PASSWORD,
  verification_url: process.env.EMAIL_VERIFICATION_URL,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  reset_password_url: process.env.RESET_PASSWORD_URL,
  verify_user_url: process.env.VERIFY_USER_URL,

  jwt: {
    accessTokenSecret: process.env.JWT_ACCESSTOKEN_SECRET,
    refreshTokenSecret: process.env.JWT_REFRESHTOKEN_SECRET,
    accessTokenExpireIn: process.env.JWT_ACCESSTOKEN_EXPIRE,
    refreshTokenExpireIn: process.env.JWT_REFRESHTOKEN_EXPIRE,
    tokenSecret: process.env.JWT_TOKEN_SESECRET,
  },
};
