import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { AppError } from '../../../utils/app-error';
import { errorMessages } from '../../../utils/error-messages';
import { AppDataSource } from '../../../database';
import { EmailTemplatesEntity } from '../../email-templates/entity/entity';
import { SmtpSettingsEntity } from '../entity/entity';
import { orgSMTPTransporter } from '../../../node-mailer/for-org/transporter';

export const sendOrgSMTPMail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const smtpRepo = AppDataSource.getRepository(SmtpSettingsEntity);
    const emailTemplateRepo = AppDataSource.getRepository(EmailTemplatesEntity);

    if (!req.params.templateId) {
      next(new AppError(errorMessages.emailTemplates.error.notFound, 404));
      return;
    }

    const existSmtpConfigured = await smtpRepo.findOneBy({
      organization_id: req.user.organization_id,
    });

    if (!existSmtpConfigured) {
      next(new AppError(errorMessages.smtp.error.notConfigure, 400));
      return;
    }

    const resData = await emailTemplateRepo.findOneBy({
      id: req.params.templateId,
      organization_id: req.user.organization_id,
    });

    if (!resData) {
      next(new AppError(errorMessages.emailTemplates.error.notFound, 404));
      return;
    }
    const resEmail = await orgSMTPTransporter(existSmtpConfigured, resData);
    return res.status(200).json({
      code: 200,
      message: 'Mail sent',
      status: 'success',
      data: resEmail,
    });
  }
);
