import nodemailer from 'nodemailer';

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

export const orgSMTPTransporter = async (
  smtpData: ISmtpPost,
  emailData: IEmailTemplate
) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: smtpData.host,
    port: smtpData.port,
    secure: smtpData.secure,
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  const info = await transporter.sendMail({
    from: `"${smtpData?.sender_name}" <${smtpData?.sender_email}>`,
    to: 'someone@example.com',
    subject: emailData.subject,
    html: emailData.html,
  });

  return nodemailer.getTestMessageUrl(info);
};
