import { createHash } from 'node:crypto';
import { AppError } from '../../errors/AppError';
import { InvalidCredentialsError } from '../../errors/InvalidCredentialsError';
import { ITokenService } from '../../shared/jwt/ITokenService';
import { IPasswordService } from '../../shared/password/IPasswordService';
import { IUserRepository, PublicUser } from '../users/IUserRepository';
import { UserService } from '../users/UserService';
import { IAuthRepository } from './IAuthRepository';





export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResult extends TokenPair {
  user: PublicUser;
}


export class AuthService {
     // Todas as dependências são INTERFACES (abstrações) injetadas pelo construtor
     constructor(
        private readonly userRepository: IUserRepository,
        private readonly authRepository: IAuthRepository,
        private readonly passwordService: IPasswordService,
        private readonly tokenService: ITokenService,
     ) {}

      async login(email: string, password: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);
    // Mesma mensagem para "e-mail não existe" e "senha errada": evita enumerar usuários.
    if (!user) throw new InvalidCredentialsError();

    const passwordMatches = await this.passwordService.compare(password, user.passwordHash);
    if (!passwordMatches) throw new InvalidCredentialsError();

    const tokens = await this.issueTokens(user.id);
    return { user: UserService.toPublic(user), ...tokens };
      }

     /** Rotação: cada refresh token só pode ser usado uma vez. */
     async refresh(refreshToken: string): Promise<TokenPair> {
        const {userId} = this.tokenService.verifyRefreshToken(refreshToken);
        const tokenHash = AuthService.hashToken(refreshToken);

        const stored = await this.authRepository.findRefreshToken(tokenHash)
        if (!stored) throw new AppError('Refresh token inválido', 401);

        if (stored.revokedAt) {
             // Token já usado sendo reapresentado = possível roubo: derruba todas as sessões.
             await this.authRepository.revokeAllFromUser(stored.userId);
             throw new AppError('Sessão inválida. Faça login novamente', 401);
        }

        if (stored.expiresAt <= new Date()) throw new AppError('Refresh token expirado', 401);

        const user = await this.userRepository.findById(userId);
        if (!user) throw new AppError('Refresh token inválido', 401);

        await this.authRepository.revokeRefreshToken(tokenHash);
        return this.issueTokens(userId);
     }

     async logout(refreshToken: string): Promise<void> {
        await this.authRepository.revokeRefreshToken(AuthService.hashToken(refreshToken));
     }

     private async issueTokens(userId: string): Promise<TokenPair> {
        const accessToken = this.tokenService.signAccessToken(userId);
        const refresh = this.tokenService.signRefreshToken(userId);

        // No banco guardamos só o hash: se o banco vazar, os tokens não servem.
        await this.authRepository.saveRefreshToken({
            userId,
            tokenHash: AuthService.hashToken(refresh.token),
            expiresAt:  refresh.expiresAt,
        });

        return { accessToken, refreshToken: refresh.token };
     }

     private static hashToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
     }
}