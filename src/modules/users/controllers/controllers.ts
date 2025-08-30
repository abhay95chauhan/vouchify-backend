import { NextFunction, Request, Response } from 'express';
import { catchAsync } from '../../../utils/catch-async';
import { AppDataSource } from '../../../database';
import { UserEntity } from '../entity/entity';
import { AppError } from '../../../utils/app-error';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { errorMessages } from '../../../utils/error-messages';
import { ApiKeyEntity } from '../../api-key/entity/entity';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;
const NODE_ENV = process.env.NODE_ENV as string;

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await AppDataSource.getRepository(UserEntity);

    if (!email || !password) {
      next(new AppError('Email and password are required', 400));
      return;
    }

    const isExist = await user.findOne({
      where: { email: req.body.email },
    });

    if (!isExist) {
      next(new AppError(errorMessages.auth.error.login, 400));
      return;
    }

    const isMatch = await bcrypt.compare(password, isExist?.password);

    if (!isMatch) {
      next(new AppError(errorMessages.auth.error.login, 400));
      return;
    }

    const payload = {
      id: isExist.id,
      email: isExist.email,
      role: isExist.role,
      organization_id: isExist.organization_id,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    } as SignOptions);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
    });

    return res.status(200).json({
      code: 200,
      message: errorMessages.auth.success.login,
      status: 'success',
      token,
      data: payload,
    });
  }
);

const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = AppDataSource.getRepository(UserEntity);

    const isExist = await user.findOne({
      where: { email: req.body.email },
    });

    if (isExist) {
      next(new AppError(errorMessages.auth.error.create, 400));
      return;
    }

    const newUser = user.create(req.body); // just creates instance
    const savedUser: any = await user.save(newUser); // actually saves to DB

    res.status(200).json({
      code: 200,
      message: errorMessages.auth.success.create,
      status: 'success',
      data: savedUser,
    });
  }
);

const logout = async (_: Request, res: Response, next: NextFunction) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    code: 200,
    message: errorMessages.auth.success.logout,
    status: 'success',
  });
};

const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string | undefined;
    const apiSecret = req.headers['x-api-secret'] as string | undefined;

    let savedApiKey: ApiKeyEntity | null = null;
    let token: string | undefined;

    if (apiKey && apiSecret) {
      const apiKeyRepo = AppDataSource.getRepository(ApiKeyEntity);
      savedApiKey = await apiKeyRepo.findOneBy({
        api_key: apiKey,
        api_secret: apiSecret,
      });

      if (!savedApiKey) {
        return next(new AppError('Invalid API Key and API Secret!', 401));
      }
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token && !savedApiKey) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    let userId: string | undefined;

    if (savedApiKey) {
      userId = savedApiKey.user_id;
    } else if (token) {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded?.id;
    }

    if (!userId) {
      return next(new AppError('Authentication failed!', 401));
    }

    const userRepo = AppDataSource.getRepository(UserEntity);
    const currentUser = await userRepo.findOne({ where: { id: userId } });

    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    req.user = currentUser;
    next();
  }
);

// get Me

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = AppDataSource.getRepository(UserEntity);

    const isExist = await user.findOne({
      where: { id: req.user.id },
      relations: ['organization'],
    });

    if (!isExist) {
      next(new AppError(errorMessages.auth.error.notFound, 404));
      return;
    }

    res.status(200).json({
      code: 200,
      message: errorMessages.auth.success.found,
      status: 'success',
      data: isExist,
    });
  }
);

export const userController = {
  createUser,
  logout,
  loginUser,
  protect,
  getMe,
};
