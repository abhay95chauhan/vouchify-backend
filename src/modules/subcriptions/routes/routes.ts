import express from 'express';
import { subcriptionController } from '../controllers/controller';

const subcriptionRouter = express.Router();

subcriptionRouter.get('/list', subcriptionController.getAllSubcriptions);
subcriptionRouter.post('/', subcriptionController.createSubcription);
subcriptionRouter.patch('/:id', subcriptionController.updateSubcription);
subcriptionRouter.delete('/:id', subcriptionController.deleteSubcription);

export default subcriptionRouter;
