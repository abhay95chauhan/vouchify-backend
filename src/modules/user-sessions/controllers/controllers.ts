import { DeepPartial } from 'typeorm';
import { UserSessionsEntity } from '../entity/entity';
import { AppDataSource } from '../../../database';
import { catchAsync } from '../../../utils/catch-async';
import { paginateAndSearch } from '../../../utils/search-pagination';
import { NextFunction, Request, Response } from 'express';
import { errorMessages } from '../../../utils/error-messages';
import { AppError } from '../../../utils/app-error';

interface IUserData {
  user_id: string;
  token: string;
  user_agent?: string;
  ip_address?: string;
  expires_at: Date;
}

const createSession = async (userData: IUserData) => {
  const userSessionRepo = AppDataSource.getRepository(UserSessionsEntity);

  const newSession = userSessionRepo.create(
    userData as DeepPartial<UserSessionsEntity>
  );
  const savedSession = await userSessionRepo.save(newSession);

  return savedSession;
};

const getAllUserSession = catchAsync(async (req: Request, res: Response) => {
  const userSessionRepo = AppDataSource.getRepository(UserSessionsEntity);

  const userSessionsRes = await userSessionRepo.find({
    where: {
      user_id: req.user.id,
    },
    order: { created_at: 'DESC' },
  });

  return res.status(200).json({
    code: 200,
    message: errorMessages.userSessions.success.list,
    status: 'success',
    data: userSessionsRes,
  });
});

const updateUserSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userSessionRepo = AppDataSource.getRepository(UserSessionsEntity);

    if (!req.params.id) {
      next(new AppError(errorMessages.userSessions.error.notFound, 404));
      return;
    }

    const userSessionsRes = await userSessionRepo.findOneBy({
      id: req.params.id,
    });

    if (!userSessionsRes) {
      next(new AppError(errorMessages.userSessions.error.notFound, 404));
      return;
    }

    await userSessionRepo.update(
      {
        id: req.params.id,
      },
      req.body
    );

    return res.status(200).json({
      code: 200,
      message: errorMessages.userSessions.success.update,
      status: 'success',
      data: userSessionsRes,
    });
  }
);

const deleteUserSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userSessionRepo = AppDataSource.getRepository(UserSessionsEntity);

    if (!req.params.id) {
      next(new AppError(errorMessages.userSessions.error.notFound, 404));
      return;
    }

    const userSessionsRes = await userSessionRepo.findOneBy({
      id: req.params.id,
    });

    if (!userSessionsRes) {
      next(new AppError(errorMessages.userSessions.error.notFound, 404));
      return;
    }

    await userSessionRepo.delete({
      id: req.params.id,
    });

    return res.status(200).json({
      code: 200,
      message: errorMessages.userSessions.success.delete,
      status: 'success',
      data: userSessionsRes,
    });
  }
);

export const userSessionController = {
  createSession,
  getAllUserSession,
  updateUserSession,
  deleteUserSession,
};
