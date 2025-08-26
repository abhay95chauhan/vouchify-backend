import { NextFunction, Request, Response } from 'express';
import { OrganizationEntity } from '../entity/entity';
import { AppDataSource } from '../../../database';
import { catchAsync } from '../../../utils/catch-async';
import { UserEntity } from '../../users/entity/entity';
import { AppError } from '../../../utils/app-error';
import { updateSubcriptionForFreePlan } from '../middleware/middleware';
import { errorMessages } from '../../../utils/error-messages';

const getMyOrganization = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const organization = AppDataSource.getRepository(OrganizationEntity);
    const resData = await organization.findOneBy({
      id: req.user.organization_id,
    });

    if (!resData) {
      next(new AppError(errorMessages.organization.error.notFound, 404));
      return;
    }

    return res.status(200).json({
      code: 200,
      message: errorMessages.organization.success.found,
      status: 'success',
      data: resData,
    });
  }
);

const createOrganizations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const organizationRepo = AppDataSource.getRepository(OrganizationEntity);
    const user = AppDataSource.getRepository(UserEntity);

    const newOrganization = organizationRepo.create({
      ...req.body,
      email: req.user.email,
    });
    const savedOrganization: any = await organizationRepo.save(newOrganization); // actually saves to DB

    await user.update(
      { id: req.user.id }, // find which user to update
      { organization_id: savedOrganization.id } // fields to update
    );

    res.status(200).json({
      code: 200,
      message: errorMessages.organization.success.create,
      status: 'success',
      data: savedOrganization,
    });
  }
);

const updateMyOrganization = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const organizationRepo = AppDataSource.getRepository(OrganizationEntity);

    const savedOrganization = await organizationRepo.update(
      { id: req.user.organization_id },
      { ...req.body }
    );

    res.status(200).json({
      code: 200,
      message: errorMessages.organization.success.update,
      status: 'success',
      data: savedOrganization,
    });
  }
);

export const organizationController = {
  getMyOrganization,
  createOrganizations,
  updateMyOrganization,
  updateSubcriptionForFreePlan,
};
