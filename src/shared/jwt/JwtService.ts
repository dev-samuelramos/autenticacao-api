import { randomUUID } from 'node:crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from '../../errors/AppError';
import { ITokenService, SignedRefreshToken, TokenPayload } from './ITokenService';


export interface JwtConfig {
    accessSecret: string;
    refreshSecret: string;
    accessExpiresInSeconds: number;
    refreshExpiresInSeconds: number;
}

export class JwtService implements ITokenService {
    constructor(private readonly config: JwtConfig) {}

    signAccessToken(userId: string): string {
        return jwt.sign({}, this.config.accessSecret, {
            subject: userId,
            expiresIn: this.config.accessExpiresInSeconds,
            algorithm: 'HS256',
        });
    }

    signRefreshToken(userId: string): SignedRefreshToken {
        const token = jwt.sign({}, this.config.refreshSecret, {
            subject: userId,
            jwtid: randomUUID (), // garante que dois tokens no mesmo segundo sejam diferentes
            expiresIn: this.config.refreshExpiresInSeconds,
             algorithm: 'HS256',
        });
        const { exp } = jwt.decode(token) as JwtPayload;
        return {token, expiresAt: new Date((exp as number) * 1000) };
    }

    verifyAccessToken(token: string): TokenPayload {
        return this.verify(token, this.config.accessSecret);
    }

    verifyRefreshToken(token: string): TokenPayload {
        return this.verify(token, this.config.refreshSecret);
    }

    private verify(token: string, secret: string): TokenPayload {
        try {
            const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload;
            if (!payload.sub) throw new Error('sem subject');
            return {userId: payload.sub};
        }catch {
            throw new AppError('Token inválido ou expirado', 401);
        }
    }
}