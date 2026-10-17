import { AppError } from '../../src/errors/AppError';
import { InvalidCredentialsError } from '../../src/errors/InvalidCredentialsError';
import { ITokenService } from '../../src/shared/jwt/ITokenService';
import { IPasswordService } from '../../src/shared/password/IPasswordService';
import { IAuthRepository } from '../../src/modules/auth/IAuthRepository';
import { AuthService } from '../../src/modules/auth/AuthService';
import { IUserRepository, User } from '../../src/modules/users/IUserRepository';

describe('AuthService', () => {
  // DUBLÊS (mocks): só funcionam porque o serviço depende de INTERFACES.
  const userRepo: jest.Mocked<IUserRepository> = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };
  const authRepo: jest.Mocked<IAuthRepository> = {
    saveRefreshToken: jest.fn(),
    findRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllFromUser: jest.fn(),
  };
  const passwordService: jest.Mocked<IPasswordService> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };
  const tokenService: jest.Mocked<ITokenService> = {
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const user: User = {
    id: 'user-1',
    name: 'Samuel',
    email: 'samuel@email.com',
    passwordHash: 'hash',
    createdAt: new Date(),
  };

  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(userRepo, authRepo, passwordService, tokenService);
    tokenService.signAccessToken.mockReturnValue('access-token');
    tokenService.signRefreshToken.mockReturnValue({
      token: 'refresh-token',
      expiresAt: new Date(Date.now() + 60_000),
    });
  });

  describe('login', () => {
    it('retorna usuário público e tokens com credenciais corretas', async () => {
      userRepo.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(true);

      const result = await service.login(user.email, '12345678');

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(authRepo.saveRefreshToken).toHaveBeenCalledTimes(1);
    });

    it('lança InvalidCredentialsError se a senha estiver errada', async () => {
      userRepo.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(false);

      await expect(service.login(user.email, 'errada')).rejects.toBeInstanceOf(InvalidCredentialsError);
      expect(authRepo.saveRefreshToken).not.toHaveBeenCalled();
    });

    it('lança InvalidCredentialsError se o usuário não existir', async () => {
      userRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login('x@x.com', '12345678')).rejects.toBeInstanceOf(InvalidCredentialsError);
      expect(passwordService.compare).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    it('rotaciona: revoga o token antigo e emite um novo par', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({ userId: user.id });
      authRepo.findRefreshToken.mockResolvedValue({
        id: '1',
        userId: user.id,
        tokenHash: 'h',
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
      });
      userRepo.findById.mockResolvedValue(user);

      const result = await service.refresh('old-refresh');

      expect(authRepo.revokeRefreshToken).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    });

    it('detecta reutilização de token revogado e derruba todas as sessões', async () => {
      tokenService.verifyRefreshToken.mockReturnValue({ userId: user.id });
      authRepo.findRefreshToken.mockResolvedValue({
        id: '1',
        userId: user.id,
        tokenHash: 'h',
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: new Date(),
      });

      await expect(service.refresh('old-refresh')).rejects.toBeInstanceOf(AppError);
      expect(authRepo.revokeAllFromUser).toHaveBeenCalledWith(user.id);
    });
  });
});