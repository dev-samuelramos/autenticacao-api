import { env } from './config/env';
import { pool } from './database/pool';
import { createAuthMiddleware } from './middlewares/auth.middleware';
import { AuthController } from './modules/auth/AuthController';
import { AuthRepository } from './modules/auth/AuthRepository';
import { AuthService } from './modules/auth/AuthService';
import { UserController } from './modules/users/UserController';
import { UserRepository } from './modules/users/UserRepository';
import { UserService } from './modules/users/UserService';
import { JwtService } from './shared/jwt/JwtService';
import { PasswordService } from './shared/password/PasswordService';



// shared
const passwordService = new PasswordService(env.BCRYPT_ROUNDS);
const tokenService = new JwtService({
  accessSecret: env.JWT_ACCESS_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  accessExpiresInSeconds: env.JWT_ACCESS_EXPIRES_SECONDS,
  refreshExpiresInSeconds: env.JWT_REFRESH_EXPIRES_SECONDS,
});

// repositories
const userRepository = new UserRepository(pool);
const authRepository = new AuthRepository(pool);


// services
const userService = new UserService(userRepository, passwordService);
const authService = new AuthService(userRepository, authRepository, passwordService, tokenService);

// controllers + middleware
export const userController = new UserController(userService);
export const authController = new AuthController(authService);
export const authMiddleware = createAuthMiddleware(tokenService);