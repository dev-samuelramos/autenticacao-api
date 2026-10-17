import { AppError } from './AppError';


export class InvalidCredentialsError extends AppError {
    constructor() {
        super('E-mail ou senha inválidos', 401);
    }
}