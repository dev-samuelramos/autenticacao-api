import bcrypt from 'bcryptjs';
import { IPasswordService } from './IPasswordService';


export class  PasswordService implements IPasswordService {
    // ENCAPSULAMENTO: o custo do hash é detalhe interno
    constructor(private readonly rounds: number =12) {}

    hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, this.rounds);
    }

    compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}