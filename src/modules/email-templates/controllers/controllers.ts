import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { AppDataSource } from '../../../database';
import { EmailTemplatesEntity } from '../entity/entity';
import { errorMessages } from '../../../utils/error-messages';
import { AppError } from '../../../utils/app-error';
import { ILike } from 'typeorm';

const createEmailTemplate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const emailTemplateRepo = AppDataSource.getRepository(EmailTemplatesEntity);

    const newTemplate = emailTemplateRepo.create({
      ...req.body,
      organization_id: req.user.organization_id,
    });
    const savedTemplate: any = await emailTemplateRepo.save(newTemplate); // actually saves to DB

    res.status(201).json({
      code: 201,
      message: errorMessages.emailTemplates.success.create,
      status: 'success',
      data: savedTemplate,
    });
  }
);

const getEmailTemplateById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      next(new AppError(errorMessages.emailTemplates.error.notFound, 404));
      return;
    }

    const emailTemplateRepo = AppDataSource.getRepository(EmailTemplatesEntity);

    const resData = await emailTemplateRepo.findOneBy({
      id: req.params.id,
      organization_id: req.user.organization_id,
    });

    if (!resData) {
      next(new AppError(errorMessages.emailTemplates.error.notFound, 404));
      return;
    }

    return res.status(200).json({
      code: 200,
      message: errorMessages.emailTemplates.success.found,
      status: 'success',
      data: resData,
    });
  }
);

const updateEmailTemplate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      next(new AppError(errorMessages.emailTemplates.error.notFound, 404));
      return;
    }

    const emailTemplateRepo = AppDataSource.getRepository(EmailTemplatesEntity);

    const existTemplateData = await emailTemplateRepo.findOneBy({
      id: req.params.id,
      organization_id: req.user.organization_id,
    });

    if (!existTemplateData) {
      next(new AppError(errorMessages.emailTemplates.error.notFound, 404));
      return;
    }

    await emailTemplateRepo.update(
      { id: req.params.id },
      { ...req.body, updated_at: new Date() }
    );

    res.status(200).json({
      code: 200,
      message: errorMessages.emailTemplates.success.update,
      status: 'success',
      data: existTemplateData,
    });
  }
);

const deleteEmailTemplate = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      next(new AppError(errorMessages.emailTemplates.error.notFound, 404));
      return;
    }

    const emailTemplateRepo = AppDataSource.getRepository(EmailTemplatesEntity);

    const existTemplateData = await emailTemplateRepo.findOneBy({
      id: req.params.id,
      organization_id: req.user.organization_id,
    });

    if (!existTemplateData) {
      next(new AppError(errorMessages.voucher.error.notFound, 404));
      return;
    }

    await emailTemplateRepo.delete({ id: req.params.id });

    res.status(204).json({
      code: 204,
      message: errorMessages.emailTemplates.success.delete,
      status: 'success',
      data: {},
    });
  }
);

const getAllEmailTemplates = catchAsync(async (req: Request, res: Response) => {
  const emailTemplateRepo = AppDataSource.getRepository(EmailTemplatesEntity);

  // 🔹 Extract query params (with defaults)
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';

  // 🔹 Offset for pagination
  const skip = (page - 1) * limit;

  // 🔹 Build where condition
  const where = search
    ? {
        name: ILike(`%${search}%`),
        subject: ILike(`%${search}%`),
        category: ILike(`%${search}%`),
        organization_id: req.user.organization_id,
      }
    : { organization_id: req.user.organization_id };

  // 🔹 Find with pagination & search
  const [data, total] = await emailTemplateRepo.findAndCount({
    where,
    order: { updated_at: 'ASC' },
    take: limit,
    skip,
  });

  return res.status(200).json({
    code: 200,
    message: errorMessages.emailTemplates.success.list,
    status: 'success',
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const emailTemplateController = {
  createEmailTemplate,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
  getAllEmailTemplates,
};
