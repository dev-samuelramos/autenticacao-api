import { Router } from 'express';
import { authMiddleware, userController } from '../../container';
import { validate } from '../../middlewares/validate.middleware';
import { registerSchema } from './user.schema';

const router = Router();

router.post('/', validate(registerSchema), userController.register);
router.get('/me', authMiddleware, userController.me);

export default router;