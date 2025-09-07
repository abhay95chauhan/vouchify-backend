import express from 'express';
import { userController } from '../../users/controllers/controllers';
import { smtpController } from '../controllers/controllers';
import { sendOrgSMTPMail } from '../controllers/send-mail-controller';

const smtpSettingsRouter = express.Router();

// smtpSettingsRouter.use(rateLimiterByPlan);
smtpSettingsRouter.use(userController.protect);

smtpSettingsRouter.post('/', smtpController.smtpConfigure);
smtpSettingsRouter.get('/', smtpController.getOrgnizationSmtpConfiguration);

smtpSettingsRouter.post('/send-email/:templateId', sendOrgSMTPMail);

export default smtpSettingsRouter;
