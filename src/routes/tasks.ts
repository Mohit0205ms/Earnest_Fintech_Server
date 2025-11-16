import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  toggleTask,
  deleteTask
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getTasks as any);

router.post('/', createTask as any);

router.get('/:id', getTask as any);

router.patch('/:id', updateTask as any);

router.patch('/:id/toggle', toggleTask as any);

router.delete('/:id', deleteTask as any);

export default router;
