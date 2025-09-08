import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../../../database';
import { catchAsync } from '../../../utils/catch-async';
import { errorMessages } from '../../../utils/error-messages';
import { AppError } from '../../../utils/app-error';
import { SmtpSettingsEntity } from '../entity/entity';
import { sendOrgTemplateMailService } from '../helpers/send-mail';

const smtpConfigure = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const smtpRepo = AppDataSource.getRepository(SmtpSettingsEntity);

    // Upsert directly by organization_id
    await smtpRepo.upsert(
      {
        ...req.body,
        secure: req.body.port === 465,
        organization_id: req.user.organization_id,
      },
      ['organization_id'] // 👈 conflict target
    );

    // Fetch the latest configuration back
    const smtpConfig = await smtpRepo.findOneBy({
      organization_id: req.user.organization_id,
    });

    res.status(200).json({
      code: 200,
      message: errorMessages.smtp.success.configure,
      status: 'success',
      data: smtpConfig,
    });
  }
);

const getOrgnizationSmtpConfiguration = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const smtpRepo = AppDataSource.getRepository(SmtpSettingsEntity);

    const existSmtpConfigured = await smtpRepo.findOneBy({
      organization_id: req.user.organization_id,
    });

    if (!existSmtpConfigured) {
      next(new AppError(errorMessages.smtp.error.notFound, 404));
      return;
    }

    res.status(200).json({
      code: 200,
      message: errorMessages.smtp.success.found,
      status: 'success',
      data: existSmtpConfigured,
    });
  }
);

const sendTestMail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { templateId, email } = req.body;

    const mailres = await sendOrgTemplateMailService({
      organization_id: req.user.organization_id,
      templateId: templateId,
      sendTo: email,
    });

    return res.status(200).json({
      code: 200,
      message: errorMessages.smtp.success.mailSend,
      status: 'success',
      data: mailres,
    });
  }
);

export const smtpController = {
  smtpConfigure,
  getOrgnizationSmtpConfiguration,
  sendTestMail,
};
