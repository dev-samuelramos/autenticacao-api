import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { authController } from '../../container';
import { env } from '../../config/env';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema } from './auth.schema';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10, // 10 tentativas de login por IP a cada 15 min
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de login. Tente novamente mais tarde' },
  skip: () => env.NODE_ENV === 'test',
});

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;