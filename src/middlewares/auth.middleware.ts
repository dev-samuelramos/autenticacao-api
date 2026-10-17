import { RequestHandler } from 'express';
import { AppError } from '../errors/AppError';
import { ITokenService } from '../shared/jwt/ITokenService';


// INJEÇÃO DE DEPENDÊNCIA: o middleware recebe o serviço de token pronto.
export function createAuthMiddleware(tokenService: ITokenService): RequestHandler {
    return (req,res,next) => {
        const header = req.headers.authorization;


        if(!header || !header.startsWith('Bearer ')) {
            throw new AppError('Token não informado', 401);
        }

        const {userId} = tokenService.verifyAccessToken(header.slice(7));
        req.user = {id: userId};
        next();
    };
}