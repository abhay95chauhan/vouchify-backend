import { NextFunction, Request, Response } from 'express';
import { OrganizationEntity } from '../entity/entity';
import { AppDataSource } from '../../../database';
import { catchAsync } from '../../../utils/catch-async';
import { UserEntity } from '../../users/entity/entity';
import { AppError } from '../../../utils/app-error';
import { updateSubcriptionForFreePlan } from '../middleware/middleware';
import { errorMessages } from '../../../utils/error-messages';
import { ApiKeyEntity } from '../../api-key/entity/entity';

const getMyOrganization = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const organization = AppDataSource.getRepository(OrganizationEntity);
    const resData = await organization.findOne({
      where: {
        id: req.user.organization_id,
      },
      relations: ['api_keys'],
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

const createOrganizations = catchAsync(async (req: Request, res: Response) => {
  const organizationRepo = AppDataSource.getRepository(OrganizationEntity);
  const userRepo = AppDataSource.getRepository(UserEntity);
  const apiKeyRepo = AppDataSource.getRepository(ApiKeyEntity);

  // 1. Create org without api_key_id
  const newOrganization = organizationRepo.create({
    ...req.body,
    email: req.user.email,
  });

  const savedOrganization: any = await organizationRepo.save(newOrganization);

  // 2. Create api key for this org
  await apiKeyRepo.upsert(
    {
      api_key: `api-${crypto.randomUUID()}`,
      api_secret: `sk-${crypto.randomUUID()}`,
      organization_id: savedOrganization.id,
      user_id: req.user.id,
    },
    ['organization_id'] // 👈 conflict target
  );

  const savedApiKey: ApiKeyEntity | null = await apiKeyRepo.findOneBy({
    organization_id: savedOrganization.id,
    user_id: req.user.id,
  });

  // 3. Attach api key to org
  await organizationRepo.update(
    { id: savedOrganization.id },
    { api_key_id: savedApiKey?.id }
  );

  // 4. Attach org to user
  await userRepo.update(
    { id: req.user.id },
    { organization_id: savedOrganization.id }
  );

  const updatedOrg = await organizationRepo.findOne({
    where: { id: savedOrganization.id },
    relations: ['api_keys'],
  });

  res.status(200).json({
    code: 200,
    message: errorMessages.organization.success.create,
    status: 'success',
    data: updatedOrg,
  });
});

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
