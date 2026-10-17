export interface StoredRefreshToken {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
}

export interface SaveRefreshTokenData {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
}

/** CONTRATO do repositório de sessões (refresh tokens). */
export interface IAuthRepository {
    saveRefreshToken(data: SaveRefreshTokenData): Promise<void>;
    findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null>;
    revokeRefreshToken(tokenHash: string): Promise<void>;
    revokeAllFromUser(userId: string): Promise<void>;
}