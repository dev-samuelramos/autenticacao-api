import { AppError } from './AppError';


export class UserNotFoundError extends AppError {
    constructor() {
        super('Usuário não encontrado', 404);
    }
}