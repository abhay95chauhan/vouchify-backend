import express from 'express';
import { userController } from '../../users/controllers/controllers';
import { redeemController } from '../controllers/controllers';

const redeemVoucherRouter = express.Router();

redeemVoucherRouter.use(userController.protect);

redeemVoucherRouter.post(
  '/:voucherCode',
  redeemController.createVoucherRedeemption
);

export default redeemVoucherRouter;
