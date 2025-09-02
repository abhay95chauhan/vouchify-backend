import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { AppDataSource } from '../../../database';
import { VouchersEntity } from '../entity/entity';
import { ILike } from 'typeorm';
import { AppError } from '../../../utils/app-error';
import { errorMessages } from '../../../utils/error-messages';
import moment from 'moment-timezone';
import { discountType, redeemPerUser } from '../helpers/config';

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

    await voucherRepo.update({ code: req.params.code }, { ...req.body });

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
    const { code, orderAmount, currencySymbol } = req.body;

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

    const now = moment.tz(req.user?.organization?.timezone)?.startOf('day'); // current time
    const start = moment(voucherData.start_date)?.startOf('day');
    const end = moment(voucherData.end_date)?.endOf('day'); // 👈 extend to end of day

    if (now?.isBefore(start)) {
      next(new AppError(errorMessages.voucher.error.voucherNotActive, 400));
      return;
    }

    if (now?.isAfter(end)) {
      next(new AppError(errorMessages.voucher.error.voucherExpired, 400));
      return;
    }

    if (
      voucherData.max_redemptions &&
      voucherData.redemption_count >= voucherData.max_redemptions
    ) {
      next(new AppError(errorMessages.voucher.error.voucherLimitExceeded, 400));
      return;
    }

    if (orderAmount < voucherData.min_order_amount) {
      next(
        new AppError(
          `Amount must be at least ${currencySymbol} ${voucherData.min_order_amount} to use this voucher`,
          400
        )
      );
      return;
    }

    // if (voucherData.redeem_limit_per_user === redeemPerUser[0]) {

    // }

    // ✅ Calculate discount
    let discount = 0;
    if (voucherData.discount_type === discountType[1]) {
      discount = (orderAmount * voucherData.discount_value) / 100;
      if (
        voucherData.max_discount_amount &&
        discount > voucherData.max_discount_amount
      ) {
        discount = voucherData.max_discount_amount;
      }
    } else {
      discount = voucherData.discount_value;
    }

    return res.status(200).json({
      code: 200,
      message: errorMessages.voucher.success.found,
      status: 'success',
      data: {
        discount,
        finalAmount: orderAmount - discount,
        orderAmount,
        voucherData,
      },
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
    const where = search
      ? {
          code: ILike(`%${search}%`),
          organization_id: req.user.organization_id,
        }
      : { organization_id: req.user.organization_id };

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
  deleteOrganizationVoucher,
  validateVoucherByCode,
};
