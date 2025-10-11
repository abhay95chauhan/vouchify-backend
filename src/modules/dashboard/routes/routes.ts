import express from 'express';
import { userController } from '../../users/controllers/controllers';
import { dashboardController } from '../controllers/controllers';

const dashboardRouter = express.Router();

// smtpSettingsRouter.use(rateLimiterByPlan);
dashboardRouter.use(userController.protect);

dashboardRouter.get('/', dashboardController.dashboard);

export default dashboardRouter;
