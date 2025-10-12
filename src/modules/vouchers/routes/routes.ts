import express from 'express';
import { userController } from '../../users/controllers/controllers';
import { vouchersController } from '../controllers/controllers';

const vouchersRouter = express.Router();

vouchersRouter.use(userController.protect);

vouchersRouter.post('/list', vouchersController.getAllOrganizationVouchers);
vouchersRouter.post('/recent/list', vouchersController.getRecentVouchers);
vouchersRouter.post('/', vouchersController.createOrganizationVoucher);
vouchersRouter.post('/validate', vouchersController.validateVoucherByCode);
vouchersRouter.get('/:code', vouchersController.getVoucherByCode);
vouchersRouter.patch('/:code', vouchersController.updateOrganizationVoucher);
vouchersRouter.delete('/:code', vouchersController.deleteOrganizationVoucher);

// smtp mail
vouchersRouter.post('/send-mail', vouchersController.sendVoucherInMail);

export default vouchersRouter;
