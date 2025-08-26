import express from 'express';
import { userController } from '../../users/controllers/controllers';
import { vouchersController } from '../controllers/controllers';

const vouchersRouter = express.Router();

vouchersRouter.use(userController.protect);

vouchersRouter.get('/list', vouchersController.getAllOrganizationVouchers);
vouchersRouter.post('/', vouchersController.createOrganizationVoucher);
vouchersRouter.get('/:code', vouchersController.getVoucherByCode);
vouchersRouter.patch('/:code', vouchersController.updateOrganizationVoucher);

export default vouchersRouter;
