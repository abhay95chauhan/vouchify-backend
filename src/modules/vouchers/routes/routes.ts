import express from 'express';
import { userController } from '../../users/controllers/controllers';
import { vouchersController } from '../controllers/controllers';
import { upload } from '../helpers/multer-config';

const vouchersRouter = express.Router();

vouchersRouter.use(userController.protect);

vouchersRouter.post('/list', vouchersController.getAllOrganizationVouchers);
vouchersRouter.post('/recent/list', vouchersController.getRecentVouchers);
vouchersRouter.post('/', vouchersController.createOrganizationVoucher);
vouchersRouter.post('/validate', vouchersController.validateVoucherByCode);
vouchersRouter.post('/send-mail', vouchersController.sendVoucherInMail);

vouchersRouter.post(
  '/list/import',
  upload.single('file'),
  vouchersController.importVouchersFromCSV
);
// Support both GET and POST for CSV export (GET is better for downloads in Postman)
vouchersRouter.post('/list/export', vouchersController.exportVouchersToCSV);

// Parameterized routes - must be after specific routes
vouchersRouter.get('/:code', vouchersController.getVoucherByCode);
vouchersRouter.patch('/:code', vouchersController.updateOrganizationVoucher);
vouchersRouter.delete('/:code', vouchersController.deleteOrganizationVoucher);
vouchersRouter.delete('/', vouchersController.deleteAllOrganizationVouchers);

export default vouchersRouter;
