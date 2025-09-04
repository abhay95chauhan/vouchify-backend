import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { AppDataSource } from '../../../database';
import { SubcriptionsEntity } from '../entity/entity';
import { errorMessages } from '../../../utils/error-messages';
import { AppError } from '../../../utils/app-error';

const createSubcription = catchAsync(async (req: Request, res: Response) => {
  const subcriptionRepo = AppDataSource.getRepository(SubcriptionsEntity);

  const newTemplate = subcriptionRepo.create({
    ...req.body,
  });
  const savedSubcription: any = await subcriptionRepo.save(newTemplate); // actually saves to DB

  res.status(201).json({
    code: 201,
    message: errorMessages.subcription.success.create,
    status: 'success',
    data: savedSubcription,
  });
});

const updateSubcription = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      next(new AppError(errorMessages.subcription.error.notFound, 404));
      return;
    }

    const subcriptionRepo = AppDataSource.getRepository(SubcriptionsEntity);

    const existSubcription = await subcriptionRepo.findOneBy({
      id: req.params.id,
    });

    if (!existSubcription) {
      next(new AppError(errorMessages.subcription.error.notFound, 404));
      return;
    }

    await subcriptionRepo.update(
      { id: req.params.id },
      { ...req.body, updated_at: new Date() }
    );

    res.status(200).json({
      code: 200,
      message: errorMessages.subcription.success.update,
      status: 'success',
      data: existSubcription,
    });
  }
);

const getAllSubcriptions = catchAsync(async (req: Request, res: Response) => {
  const subcriptionRepo = AppDataSource.getRepository(SubcriptionsEntity);

  const data = await subcriptionRepo.find();

  return res.status(200).json({
    code: 200,
    message: errorMessages.subcription.success.list,
    status: 'success',
    data,
  });
});

const deleteSubcription = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.id) {
      next(new AppError(errorMessages.subcription.error.notFound, 404));
      return;
    }

    const subcriptionRepo = AppDataSource.getRepository(SubcriptionsEntity);

    const existSubcription = await subcriptionRepo.findOneBy({
      id: req.params.id,
    });

    if (!existSubcription) {
      next(new AppError(errorMessages.subcription.error.notFound, 404));
      return;
    }

    await subcriptionRepo.delete({ id: req.params.id });

    res.status(200).json({
      code: 200,
      message: errorMessages.subcription.success.delete,
      status: 'success',
      data: existSubcription,
    });
  }
);

export const subcriptionController = {
  createSubcription,
  getAllSubcriptions,
  updateSubcription,
  deleteSubcription,
};
