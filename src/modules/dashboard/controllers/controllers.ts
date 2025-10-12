// src/vouchers/controllers/voucherDashboard.controller.ts

import { LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../../../database';
import { VouchersEntity } from '../../vouchers/entity/entity';
import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { errorMessages } from '../../../utils/error-messages';
import moment from 'moment-timezone';
import { VoucherRedemptionsEntity } from '../../voucher-redeemption/entity/entity';

const dashboard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const voucherRepo = AppDataSource.getRepository(VouchersEntity);

    const redeemRepo = AppDataSource.getRepository(VoucherRedemptionsEntity);

    const tz = req.user.organization?.timezone;
    const now = moment().tz(tz).format(); // ✅ Use Date object, not string

    const total_redeemed_vouchers = await redeemRepo.count({
      where: { organization_id: req.user.organization_id },
    });

    const totalCount = await voucherRepo.count({
      where: { organization_id: req.user.organization_id },
    });

    // Active vouchers (start_date <= now <= end_date)
    const activeCount = await voucherRepo.count({
      where: {
        organization_id: req.user.organization_id,
        start_date: LessThanOrEqual(now),
        end_date: MoreThanOrEqual(now),
      },
    });

    // Expired vouchers (end_date < now)
    const expiredCount = await voucherRepo.count({
      where: {
        end_date: LessThan(now),
        organization_id: req.user.organization_id,
      },
    });

    // Upcoming vouchers (start_date > now)
    const upcomingCount = await voucherRepo.count({
      where: {
        start_date: MoreThan(now),
        organization_id: req.user.organization_id,
      },
    });

    // ✅ Nearing expiry: now <= end_date <= now + 7 days
    const nearingExpiry = await voucherRepo.count({
      where: {
        organization_id: req.user.organization_id,
        end_date: LessThanOrEqual(moment(now).add(7, 'days').toISOString()),
        start_date: MoreThanOrEqual(now),
      },
    });

    return res.status(200).json({
      code: 200,
      message: errorMessages.dashboard.success.fetch,
      status: 'success',
      data: {
        total_vouchers: totalCount,
        active_vouchers: activeCount,
        upcoming_vouchers: upcomingCount,
        total_redeemed_vouchers,
        nearing_expiry: nearingExpiry,
        expired_vouchers: expiredCount,
      },
    });
  }
);

export const dashboardController = {
  dashboard,
};
