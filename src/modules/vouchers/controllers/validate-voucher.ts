import moment from 'moment-timezone';
import { AppDataSource } from '../../../database';
import { AppError } from '../../../utils/app-error';
import { errorMessages } from '../../../utils/error-messages';
import { VouchersEntity } from '../entity/entity';
import { discountType, redeemPerUser } from '../helpers/config';
import { VoucherRedemptionsEntity } from '../../voucher-redeemption/entity/entity';

interface ValidateVoucherParams {
  code: string;
  orderAmount: number;
  productIds?: string[];
  user: any; // req.user
  email?: string; // req.user
}

export const validateVoucher = async ({
  code,
  orderAmount,
  productIds = [],
  user,
  email,
}: ValidateVoucherParams) => {
  if (!code) {
    throw new AppError(errorMessages.voucher.error.invalidCode, 404);
  }

  const voucherRepo = AppDataSource.getRepository(VouchersEntity);
  const voucherData = await voucherRepo.findOneBy({
    code,
    organization_id: user.organization_id,
  });

  if (!voucherData) {
    throw new AppError(errorMessages.voucher.error.invalidCode, 404);
  }

  const now = moment.tz(user?.organization?.timezone)?.startOf('day');
  const start = moment(voucherData.start_date)?.startOf('day');
  const end = moment(voucherData.end_date)?.endOf('day');

  if (now?.isBefore(start)) {
    throw new AppError(errorMessages.voucher.error.voucherNotActive, 400);
  }

  if (now?.isAfter(end)) {
    throw new AppError(errorMessages.voucher.error.voucherExpired, 400);
  }

  if (
    voucherData.max_redemptions &&
    voucherData.redemption_count >= voucherData.max_redemptions
  ) {
    throw new AppError(errorMessages.voucher.error.voucherLimitExceeded, 400);
  }

  if (orderAmount < voucherData.min_order_amount) {
    throw new AppError(
      `Amount must be at least ${user?.organization.currency_symbol} ${voucherData.min_order_amount} to use this voucher`,
      400
    );
  }

  if (voucherData.redeem_limit_per_user === redeemPerUser[0]) {
    const redeemRepo = AppDataSource.getRepository(VoucherRedemptionsEntity);
    const existingRedeem = await redeemRepo.findOneBy({
      voucher_id: voucherData.id,
      organization_id: user.organization_id,
      user_email: email,
    });

    if (existingRedeem) {
      throw new AppError(errorMessages.voucher.error.alreadyRedeem, 400);
    }
  }

  // ✅ Product eligibility
  if (voucherData.eligible_products?.length) {
    const isEligible = productIds?.some((p: string) =>
      voucherData.eligible_products!.includes(p)
    );
    if (!isEligible) {
      throw new AppError(errorMessages.voucher.error.notValidOnProducts, 400);
    }
  }

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

  if (discount > orderAmount) {
    throw new AppError(
      `Discount (${user?.organization.currency_symbol} ${discount}) cannot exceed order amount (${user?.organization.currency_symbol} ${orderAmount})`,
      400
    );
  }

  return {
    discount,
    finalAmount: orderAmount - discount,
    orderAmount,
    voucherData,
  };
};
