import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';



// Express 5 encaminha automaticamente erros lançados em handlers async para cá.
// Precisa ter 4 parâmetros para o Express reconhecer como handler de erro.
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({message: err.message});
        return;
    }

    if (typeof err === 'object' && err !== null && 'type' in err && err.type === 'entity.parse.failed') {
        res.status(400).json({ message: 'JSON inválido'});
        return;
    }

    console.error(err);
    res.status(500).json({message: 'Erro interno do servidor' });
}