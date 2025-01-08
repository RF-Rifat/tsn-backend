import nodemailer from 'nodemailer';
import config from '../config';

export type IEmailInfo = {
  to: string;
  subject: string;
  html: string;
};
const sendMail = async (emailInfo: IEmailInfo) => {
  const { html, subject, to } = emailInfo;
  const transporter = nodemailer.createTransport({
    host: config.email_server_host,
    port: config.email_server_port || 465,
    secure: true,
    auth: {
      user: config.email_server_user,
      pass: config.email_server_password,
    },
  } as nodemailer.TransportOptions);

  await transporter.sendMail({
    from: config.email_from,
    to,
    subject,
    html,
  });
};

export const sendMailerHelper = {
  sendMail,
};
