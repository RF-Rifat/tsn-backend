import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  email_server_host: process.env.EMAIL_SERVER_HOST,
  email_server_port: process.env.EMAIL_SERVER_PORT,
  email_server_user: process.env.EMAIL_SERVER_USER,
  email_server_password: process.env.EMAIL_SERVER_PASSWORD,
  email_from: process.env.Email_FROM,
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
