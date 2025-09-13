import express from 'express';
import { userController } from '../../users/controllers/controllers';
import { userSessionController } from '../controllers/controllers';

const userSessionRouter = express.Router();

userSessionRouter.use(userController.protect);
// userSessionRouter.use(rateLimiterByPlan);
userSessionRouter.get('/list', userSessionController.getAllUserSession);
userSessionRouter.patch('/:id', userSessionController.updateUserSession);
userSessionRouter.delete('/:id', userSessionController.deleteUserSession);

export default userSessionRouter;
