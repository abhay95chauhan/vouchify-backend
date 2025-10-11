// src/vouchers/controllers/voucherDashboard.controller.ts

import { LessThan, MoreThan } from 'typeorm';
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

    const total_redeemed_vouchers = await redeemRepo.count({
      where: { organization_id: req.user.organization_id },
    });

    const now = moment()?.format();

    // Total vouchers
    const totalCount = await voucherRepo.count({
      where: {
        organization_id: req.user.organization_id,
      },
    });

    // Active vouchers (start_date <= now <= end_date)
    const activeCount = await voucherRepo.count({
      where: {
        organization_id: req.user.organization_id,
        start_date: LessThan(now),
        end_date: MoreThan(now),
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

    return res.status(200).json({
      code: 200,
      message: errorMessages.dashboard.success.fetch,
      status: 'success',
      data: {
        total_vouchers: totalCount,
        active_vouchers: activeCount,
        expired_vouchers: expiredCount,
        upcoming_vouchers: upcomingCount,
        total_redeemed_vouchers,
      },
    });
  }
);

export const dashboardController = {
  dashboard,
};
