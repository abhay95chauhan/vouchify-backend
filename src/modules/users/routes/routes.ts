import express from 'express';
import { userController } from '../controllers/controllers';
import { updateSubcriptionForFreePlan } from '../../organization/middleware/middleware';

const userRouter = express.Router();

userRouter.post('/register', userController.createUser);
userRouter.post('/login', userController.loginUser);
userRouter.post('/logout', userController.logout);

userRouter.use(userController.protect);
userRouter.use(updateSubcriptionForFreePlan);
userRouter.get('/me', userController.getMe);

export default userRouter;
