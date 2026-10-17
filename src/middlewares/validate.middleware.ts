import { RequestHandler } from 'express';
import { ZodType } from 'zod';


export function validate(schema: ZodType): RequestHandler {
    return (req, res, next) => {
     const result = schema.safeParse(req.body);


     if (!result.success) {
        res.status(400).json ({
             message: 'Dados inválidos',
            errors: result.error.issues.map((issue) => ({
                campo: issue.path.join('.'),
                mensagem: issue.message,
            })),
        });
        return;
     } 

     req.body = result.data;
     next();
    };
}