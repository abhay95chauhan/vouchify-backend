import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { AppDataSource } from '../../../database';
import { VoucherRedemptionsEntity } from '../entity/entity';
import { errorMessages } from '../../../utils/error-messages';
import { AppError } from '../../../utils/app-error';
import { VouchersEntity } from '../../vouchers/entity/entity';
import { validateVoucher } from '../../vouchers/controllers/validate-voucher';
import { paginateAndSearch } from '../../../utils/search-pagination';
import { FindOptionsWhere } from 'typeorm';

const createVoucherRedeemption = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const voucherCode = req.params.voucherCode;

    const voucherRepo = AppDataSource.getRepository(VouchersEntity);
    const voucherData = await voucherRepo.findOneBy({
      code: voucherCode,
      organization_id: req.user.organization_id,
    });

    if (!voucherData) {
      next(new AppError(errorMessages.voucher.error.invalidCode, 404));
      return;
    }

    const { discount, finalAmount, orderAmount } = await validateVoucher({
      code: voucherCode,
      orderAmount: req.body.order_amount,
      productIds: req.body.productIds,
      user: req.user,
      email: req.body.user_email,
    });

    const redeemRepo = AppDataSource.getRepository(VoucherRedemptionsEntity);

    const newRedeemVoucher = redeemRepo.create({
      ...req.body,
      order_amount: orderAmount,
      discount_amount: discount,
      final_payable_amount: finalAmount,
      user_agent: req.headers['user-agent'],
      ip_address: req.ip,
      organization_id: req.user.organization_id,
      voucher_id: voucherData.id,
    });
    const savedRedeemVoucher: any = await redeemRepo.save(newRedeemVoucher); // actually saves to DB

    await voucherRepo.update(
      { code: voucherCode },
      {
        redemption_count: voucherData.redemption_count + 1,
        last_redeemed_at: new Date(),
      }
    );

    res.status(201).json({
      code: 201,
      message: errorMessages.voucher.redeemption.success.redeem,
      status: 'success',
      data: savedRedeemVoucher,
    });
  }
);

const getAllRedeemedVouchers = catchAsync(
  async (req: Request, res: Response) => {
    const voucherId = req.params?.voucherId;
    const voucherRedeemRepo = AppDataSource.getRepository(
      VoucherRedemptionsEntity
    );

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const orderBy = (req.query.orderBy as string) || 'DESC';
    const orderByField = (req.query.orderByField as string) || 'created_at';
    const filters =
      (req.query.filters as FindOptionsWhere<VoucherRedemptionsEntity>) || {};

    const { data, pagination } =
      await paginateAndSearch<VoucherRedemptionsEntity>({
        repo: voucherRedeemRepo,
        page: page,
        limit: limit,
        search: search,
        searchFields: [
          'voucher.name',
          'voucher.code',
          'user_name',
          'user_email',
        ],
        relations: ['voucher'],
        where: {
          organization_id: req.user.organization_id,
          voucher_id: voucherId,
        },
        // relations: ['organization'],
        order: { [orderByField]: orderBy as 'ASC' | 'DESC' }, // ✅ type-checked
        filters,
      });

    return res.status(200).json({
      code: 200,
      message: errorMessages.voucher.redeemption.success.list,
      status: 'success',
      data,
      pagination,
    });
  }
);

export const redeemController = {
  createVoucherRedeemption,
  getAllRedeemedVouchers,
};
