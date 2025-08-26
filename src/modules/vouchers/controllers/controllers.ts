import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { AppDataSource } from '../../../database';
import { VouchersEntity } from '../entity/entity';
import { ILike } from 'typeorm';
import { AppError } from '../../../utils/app-error';
import { errorMessages } from '../../../utils/error-messages';

const createOrganizationVoucher = catchAsync(
  async (req: Request, res: Response) => {
    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    const newVoucher = voucherRepo.create({
      ...req.body,
      organization_id: req.user.organization_id,
    });
    const savedVoucher: any = await voucherRepo.save(newVoucher); // actually saves to DB

    res.status(200).json({
      code: 200,
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
  async (req: Request, res: Response) => {
    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    const savedVoucher = await voucherRepo.update(
      { code: req.params.code },
      { ...req.body }
    );

    res.status(200).json({
      code: 200,
      message: errorMessages.voucher.success.update,
      status: 'success',
      data: savedVoucher,
    });
  }
);

const getAllOrganizationVouchers = catchAsync(
  async (req: Request, res: Response) => {
    const vouchersRepo = AppDataSource.getRepository(VouchersEntity);

    // 🔹 Extract query params (with defaults)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    // 🔹 Offset for pagination
    const skip = (page - 1) * limit;

    // 🔹 Build where condition
    const where = search ? { code: ILike(`%${search}%`) } : {};

    // 🔹 Find with pagination & search
    const [data, total] = await vouchersRepo.findAndCount({
      where,
      order: { code: 'ASC' },
      take: limit,
      skip,
    });

    return res.status(200).json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
);

export const vouchersController = {
  getAllOrganizationVouchers,
  createOrganizationVoucher,
  getVoucherByCode,
  updateOrganizationVoucher,
};
