import express from 'express';
import { userController } from '../../users/controllers/controllers';
import { userSessionController } from '../controllers/controllers';

const userSessionRouter = express.Router();

userSessionRouter.use(userController.protect);
// userSessionRouter.use(rateLimiterByPlan);
userSessionRouter.get('/list', userSessionController.getAllUserSession);
userSessionRouter.get('/:token', userSessionController.getUserSessionByToken);
userSessionRouter.patch('/:id', userSessionController.updateUserSession);
userSessionRouter.delete('/:id', userSessionController.deleteUserSession);
userSessionRouter.delete(
  '/sessions/revoke-all-session',
  userSessionController.deleteAllUserSession
);

export default userSessionRouter;
