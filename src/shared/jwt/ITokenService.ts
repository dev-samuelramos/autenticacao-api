export interface TokenPayload {
    userId: string;
}

export interface SignedRefreshToken {
    token: string;
    expiresAt: Date;
}


/** ABSTRAÇÃO: o AuthService não sabe se o token é JWT, PASETO, etc. */
export interface ITokenService {
    signAccessToken(userId: string): string;
    signRefreshToken(userId: string): SignedRefreshToken;
    verifyAccessToken(token: string): TokenPayload;
    verifyRefreshToken(token: string): TokenPayload;
}