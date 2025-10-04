import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { AppDataSource } from '../../../database';
import { VouchersEntity } from '../entity/entity';
import { AppError } from '../../../utils/app-error';
import { errorMessages } from '../../../utils/error-messages';
import { paginateAndSearch } from '../../../utils/search-pagination';
import { sendOrgTemplateMailService } from '../../smtp/helpers/send-mail';
import { predefinedEmailTemplates } from '../../email-templates/helpers/config';
import { validateVoucher } from './validate-voucher';
import { FindOptionsWhere } from 'typeorm';

const createOrganizationVoucher = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    const resData = await voucherRepo.findOneBy({
      code: req.body.code,
    });

    if (resData) {
      next(new AppError(errorMessages.voucher.error.voucherExist, 409));
      return;
    }

    const newVoucher = voucherRepo.create({
      ...req.body,
      organization_id: req.user.organization_id,
    });
    const savedVoucher: any = await voucherRepo.save(newVoucher); // actually saves to DB

    res.status(201).json({
      code: 201,
      message: errorMessages.voucher.success.create,
      status: 'success',
      data: savedVoucher,
    });
  }
);

const getVoucherByCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.code) {
      next(new AppError(errorMessages.voucher.error.notFound, 404));
      return;
    }

    const voucherRepo = AppDataSource.getRepository(VouchersEntity);
    const resData = await voucherRepo.findOneBy({
      code: req.params.code,
      organization_id: req.user.organization_id,
    });

    if (!resData) {
      next(new AppError(errorMessages.voucher.error.notFound, 404));
      return;
    }

    return res.status(200).json({
      code: 200,
      message: errorMessages.voucher.success.found,
      status: 'success',
      data: resData,
    });
  }
);

const updateOrganizationVoucher = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    const existVoucherData = await voucherRepo.findOneBy({
      code: req.params.code,
      organization_id: req.user.organization_id,
    });

    if (!existVoucherData) {
      next(new AppError(errorMessages.voucher.error.notFound, 404));
      return;
    }

    await voucherRepo.update(
      { code: req.params.code },
      { ...req.body, updated_at: new Date() }
    );

    res.status(200).json({
      code: 200,
      message: errorMessages.voucher.success.update,
      status: 'success',
      data: existVoucherData,
    });
  }
);

const deleteOrganizationVoucher = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.code) {
      next(new AppError(errorMessages.voucher.error.notFound, 404));
      return;
    }

    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    const existVoucherData = await voucherRepo.findOneBy({
      code: req.params.code,
      organization_id: req.user.organization_id,
    });

    if (!existVoucherData) {
      next(new AppError(errorMessages.voucher.error.notFound, 404));
      return;
    }

    await voucherRepo.delete({ code: req.params.code });

    res.status(200).json({
      code: 200,
      message: errorMessages.voucher.success.delete,
      status: 'success',
      data: existVoucherData,
    });
  }
);

const validateVoucherByCode = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, orderAmount, productIds = [], email } = req.body;

    try {
      const result = await validateVoucher({
        code,
        orderAmount,
        productIds,
        user: req.user,
        email,
      });

      return res.status(200).json({
        code: 200,
        message: errorMessages.voucher.success.found,
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
);

const getAllOrganizationVouchers = catchAsync(
  async (req: Request, res: Response) => {
    const vouchersRepo = AppDataSource.getRepository(VouchersEntity);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const orderBy = (req.query.orderBy as string) || 'ASC';
    const orderByField = (req.query.orderByField as string) || 'name';
    const filters =
      (req.body.filters as FindOptionsWhere<VouchersEntity>) || {};

    const { data, pagination } = await paginateAndSearch<VouchersEntity>({
      repo: vouchersRepo,
      page: page,
      limit: limit,
      search: search,
      searchFields: ['name', 'code', 'prefix', 'postfix'],
      where: { organization_id: req.user.organization_id },
      order: { [orderByField]: orderBy as 'ASC' | 'DESC' }, // ✅ type-checked
      filters,
    });

    return res.status(200).json({
      code: 200,
      message: errorMessages.voucher.success.list,
      status: 'success',
      data,
      pagination,
    });
  }
);

const sendVoucherInMail = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, email } = req.body;

    if (!email) {
      next(new AppError(errorMessages.invalidEmail, 400));
      return;
    }

    if (!code) {
      next(new AppError(errorMessages.voucher.error.invalidCode, 404));
      return;
    }

    const voucherRepo = AppDataSource.getRepository(VouchersEntity);
    const voucherData = await voucherRepo.findOneBy({
      code: code,
      organization_id: req.user.organization_id,
    });

    if (!voucherData) {
      next(new AppError(errorMessages.voucher.error.invalidCode, 404));
      return;
    }

    const mailres = await sendOrgTemplateMailService<VouchersEntity>({
      entityData: voucherData,
      organization_id: req.user.organization_id,
      templateName: predefinedEmailTemplates.VOUCHER,
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

export const vouchersController = {
  getAllOrganizationVouchers,
  createOrganizationVoucher,
  getVoucherByCode,
  updateOrganizationVoucher,
  deleteOrganizationVoucher,
  validateVoucherByCode,
  sendVoucherInMail,
};
