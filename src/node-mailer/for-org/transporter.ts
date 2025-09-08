import nodemailer from 'nodemailer';
import Mustache from 'mustache';

export interface ISmtpPost {
  enabled?: boolean;
  sender_email: string;
  sender_name: string;
  host: string;
  secure: boolean;
  port: number;
  username: string;
  password: string; // plain string -> will be encrypted in backend
}

export interface IEmailTemplate {
  id: string;
  name: string; // internal name
  subject: string;
  category?: string;
  created_at: string | Date;
  updated_at: string | Date;
  html: string; // full HTML template
}

interface ITransporterData<T> {
  smtpData: ISmtpPost;
  emailData: IEmailTemplate;
  entityData?: T;
  sendTo: string;
}
export const orgSMTPTransporter = async <T>(
  transporterData: ITransporterData<T>
) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: transporterData.smtpData.host,
    port: transporterData.smtpData.port,
    secure: transporterData.smtpData.secure,
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  const html = Mustache.render(
    transporterData.emailData.html,
    transporterData.entityData
  );

  const info = await transporter.sendMail({
    from: `"${transporterData.smtpData?.sender_name}" <${transporterData.smtpData?.sender_email}>`,
    to: transporterData.sendTo,
    subject: transporterData.emailData.subject,
    html,
  });

  return nodemailer.getTestMessageUrl(info);
};
