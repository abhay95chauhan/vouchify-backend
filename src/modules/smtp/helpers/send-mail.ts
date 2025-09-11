import { AppError } from '../../../utils/app-error';
import { errorMessages } from '../../../utils/error-messages';
import { AppDataSource } from '../../../database';
import { EmailTemplatesEntity } from '../../email-templates/entity/entity';
import { SmtpSettingsEntity } from '../entity/entity';
import { orgSMTPTransporter } from '../../../node-mailer/for-org/transporter';

interface IEmailService<T> {
  organization_id: string;
  templateName?: string;
  templateId?: string;
  entityData?: T;
  sendTo: string | string[];
}

export async function sendOrgTemplateMailService<T>(
  emailServiceData: IEmailService<T>
) {
  const smtpRepo = AppDataSource.getRepository(SmtpSettingsEntity);
  const emailTemplateRepo = AppDataSource.getRepository(EmailTemplatesEntity);

  if (!emailServiceData.templateName && !emailServiceData.templateId) {
    throw new AppError(errorMessages.emailTemplates.error.notFound, 404);
  }

  // 1. Check SMTP config
  const existSmtpConfigured = await smtpRepo.findOneBy({
    organization_id: emailServiceData.organization_id,
  });
  if (!existSmtpConfigured) {
    throw new AppError(errorMessages.smtp.error.notConfigure, 400);
  }

  // 2. Get template
  let emailTemplateData;

  if (emailServiceData.templateId) {
    emailTemplateData = await emailTemplateRepo.findOneBy({
      id: emailServiceData.templateId,
      organization_id: emailServiceData.organization_id,
    });
  } else {
    emailTemplateData = await emailTemplateRepo.findOneBy({
      name: emailServiceData.templateName,
      organization_id: emailServiceData.organization_id,
    });
  }

  if (!emailTemplateData) {
    throw new AppError(errorMessages.emailTemplates.error.notFound, 404);
  }

  // 3. Send
  const resEmail = await orgSMTPTransporter<T>({
    smtpData: existSmtpConfigured,
    emailData: emailTemplateData,
    entityData: emailServiceData.entityData,
    sendTo: emailServiceData.sendTo,
  });
  return resEmail;
}
