import express from 'express';
import { userController } from '../../users/controllers/controllers';
import { emailTemplateController } from '../controllers/controllers';

const emailTemplatesRouter = express.Router();

emailTemplatesRouter.use(userController.protect);

emailTemplatesRouter.get('/list', emailTemplateController.getAllEmailTemplates);
emailTemplatesRouter.post('/', emailTemplateController.createEmailTemplate);
emailTemplatesRouter.get('/:id', emailTemplateController.getEmailTemplateById);
emailTemplatesRouter.patch('/:id', emailTemplateController.updateEmailTemplate);
emailTemplatesRouter.delete(
  '/:id',
  emailTemplateController.deleteEmailTemplate
);

export default emailTemplatesRouter;
