import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { AppDataSource } from '../../../database';
import { OrganizationEntity } from '../entity/entity';
import { subcriptions } from '../helpers/config';
import moment from 'moment-timezone';

export const updateSubcriptionForFreePlan = catchAsync(
  async (req: Request, _: Response, next: NextFunction) => {
    const organizationRepo = AppDataSource.getRepository(OrganizationEntity);
    const org = await organizationRepo.findOne({
      where: { id: req.user.organization_id },
    });

    if (!org) return next();

    const now = moment.tz(org.timezone);
    const expiry = moment(org.subcription_expire).tz(org.timezone);

    if (expiry.isBefore(now) && org.subcription === subcriptions[0]) {
      await organizationRepo.update(
        { id: org.id },
        { subcription_expire: now.add(1, 'month').toDate() }
      );
    }

    next();
  }
);
