import express from 'express';
import { organizationController } from '../controllers/controller';
import { userController } from '../../users/controllers/controllers';

const organizationRouter = express.Router();

organizationRouter.use(userController.protect);
organizationRouter.use(organizationController.updateSubcriptionForFreePlan);

organizationRouter.get('/', organizationController.getMyOrganization);
organizationRouter.patch('/', organizationController.updateMyOrganization);
organizationRouter.post('/', organizationController.createOrganizations);

export default organizationRouter;
