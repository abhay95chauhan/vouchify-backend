import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { AppDataSource } from '../../../database';
import { VoucherRedemptionsEntity } from '../entity/entity';
import { errorMessages } from '../../../utils/error-messages';
import { AppError } from '../../../utils/app-error';
import { VouchersEntity } from '../../vouchers/entity/entity';
import { validateVoucher } from '../../vouchers/controllers/validate-voucher';

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

export const redeemController = {
  createVoucherRedeemption,
};
