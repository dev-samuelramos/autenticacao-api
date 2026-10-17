import { AppError } from './AppError';


export class UserAlreadyExistsError extends AppError {
    constructor() {
        super('Já existe um usuário com este e-mail', 400);
    }
}