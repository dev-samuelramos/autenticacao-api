export interface User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}

/** Usuário sem dados sensíveis, seguro para devolver na API. */
export type PublicUser = Omit<User, 'passwordHash'>;


export interface CreateUserData {
     name: string;
     email: string;
     passwordHash: string;
}

/** CONTRATO: o Service depende disto, não do PostgreSQL. */
export interface IUserRepository {
    create(data: CreateUserData): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
}