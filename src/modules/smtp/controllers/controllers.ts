import { NextFunction, Request, Response } from 'express';
import { AppDataSource } from '../../../database';
import { catchAsync } from '../../../utils/catch-async';
import { errorMessages } from '../../../utils/error-messages';
import { AppError } from '../../../utils/app-error';
import { SmtpSettingsEntity } from '../entity/entity';

const smtpConfigure = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const smtpRepo = AppDataSource.getRepository(SmtpSettingsEntity);

    const alreadyConfigured = await smtpRepo.findOneBy({
      organization_id: req.user.organization_id,
    });

    if (alreadyConfigured) {
      next(new AppError(errorMessages.smtp.error.alreadyConfigure, 400));
      return;
    }

    const newSmtp = smtpRepo.create({
      ...req.body,
      organization_id: req.user.organization_id,
    });
    const savedVoucher: any = await smtpRepo.save(newSmtp); // actually saves to DB

    res.status(200).json({
      code: 200,
      message: errorMessages.smtp.success.configure,
      status: 'success',
      data: savedVoucher,
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

const updateSmtpConfiguration = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const smtpRepo = AppDataSource.getRepository(SmtpSettingsEntity);

    const existSmtpConfigured = await smtpRepo.findOneBy({
      organization_id: req.user.organization_id,
    });

    if (!existSmtpConfigured) {
      next(new AppError(errorMessages.smtp.error.notFound, 404));
      return;
    }

    await smtpRepo.update(
      { organization_id: req.user.organization_id },
      { ...req.body }
    );

    res.status(200).json({
      code: 200,
      message: errorMessages.smtp.success.updateConfiguration,
      status: 'success',
      data: existSmtpConfigured,
    });
  }
);

export const smtpController = {
  smtpConfigure,
  getOrgnizationSmtpConfiguration,
  updateSmtpConfiguration,
};
