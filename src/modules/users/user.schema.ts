import { z } from 'zod';


export const registerSchema = z.object({
    name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres').max(120),
    email: z.string().trim().toLowerCase().email('E-mail inválido'),
    password: z.string()
    .min(8, 'Senha deve ter ao menos 8 caracteres')
    .max(72, 'Senha deve ter no máximo 72 caracteres'),
});


export type RegisterInput = z.infer<typeof registerSchema>;