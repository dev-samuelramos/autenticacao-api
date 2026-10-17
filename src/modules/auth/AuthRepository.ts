import { Pool } from 'pg';
import { IAuthRepository, SaveRefreshTokenData, StoredRefreshToken } from './IAuthRepository';



interface RefreshTokenRow {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: Date;
    revoked_at: Date | null;
}

export class AuthRepository implements IAuthRepository {
    constructor(private readonly pool: Pool) {}

    async saveRefreshToken(data: SaveRefreshTokenData): Promise<void> {
        await this.pool.query(
            `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
             [data.userId, data.tokenHash, data.expiresAt],
        );
    }

    async findRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null> {
        const {rows} = await this.pool.query<RefreshTokenRow>(
            'SELECT * FROM refresh_tokens WHERE token_hash = $1',
            [tokenHash],
        );
        const row = rows[0];
        if (!row) return null;
        return {
            id: row.id,
            userId: row.user_id,
            tokenHash: row.token_hash,
            expiresAt: row.expires_at,
            revokedAt: row.revoked_at,
        };
    }

    async revokeRefreshToken(tokenHash: string): Promise<void> {
        await this.pool.query(
            'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL',
             [tokenHash],
        );
    }

    async revokeAllFromUser(userId: string): Promise<void> {
        await this.pool.query(
             'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
             [userId],
        );
    }
}