import express from 'express';
import { userController } from '../../users/controllers/controllers';
import { redeemController } from '../controllers/controllers';

const redeemVoucherRouter = express.Router();

redeemVoucherRouter.use(userController.protect);

redeemVoucherRouter.post(
  '/:voucherCode',
  redeemController.createVoucherRedeemption
);
redeemVoucherRouter.post(
  '/organization/list',
  redeemController.getAllRedeemedVouchers
);
redeemVoucherRouter.post(
  '/organization/list/:voucherId',
  redeemController.getAllRedeemedVouchers
);

export default redeemVoucherRouter;
