import { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env';
import { AppError } from '../../errors/AppError';
import { LoginInput } from './auth.schema';
import { AuthService } from './AuthService';


const REFRESH_COOKIE = 'refreshToken';

const refreshCookieOptions: CookieOptions = {
    httpOnly: true,  // JavaScript do navegador não consegue ler
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth', // o cookie só viaja nas rotas de auth
    maxAge: env.JWT_REFRESH_EXPIRES_SECONDS * 1000,
};


// Apenas gerencia REQ e RES; a regra de negócio está no AuthService.
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    login = async (req: Request, res: Response): Promise<void> => {
        const {email, password} = req.body as LoginInput;
        const {user, accessToken, refreshToken} = await this.authService.login(email, password);

        res.cookie(REFRESH_COOKIE, refreshToken,refreshCookieOptions);
        res.status(200).json({ user, accessToken });
    };

    refresh = async (req: Request, res: Response): Promise<void> => {
        const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
        if (!token) throw new AppError('Refresh token ausente', 401);

        const {accessToken, refreshToken} = await this.authService.refresh(token);

        res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
        res.status(200).json({accessToken});
    };


    logout = async (req: Request, res: Response): Promise<void> => {
        const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
        if (token) await this.authService.logout(token);

        res.clearCookie(REFRESH_COOKIE, {...refreshCookieOptions, maxAge: undefined});
        res.status(204).send();
    };
}