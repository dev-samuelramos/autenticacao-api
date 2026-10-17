import { Pool } from 'pg';
import { UserAlreadyExistsError } from '../../errors/UserAlreadyExistsError';
import { CreateUserData, IUserRepository, User } from './IUserRepository';



interface UserRow {
    id: string;
    name: string
    email: string;
    password_hash: string;
    created_at: Date;
}

export class UserRepository implements IUserRepository {
    constructor(private readonly pool: Pool) {}


    async create(data: CreateUserData): Promise<User> {
        try{
            const { rows } = await this.pool.query<UserRow>(
              `INSERT INTO users (name, email, password_hash)
               VALUES ($1, $2, $3)
               RETURNING *`,
               [data.name, data.email, data.passwordHash],
            );
            return UserRepository.toEntity(rows[0]);
        } catch (err) {
          // 23505 = unique_violation (protege contra corrida de dois cadastros simultâneos)
          if ((err as {code?: string}).code === '23505') throw new UserAlreadyExistsError();
          throw err;
        }
    }

    async findByEmail(email: string): Promise<User | null> {
       const { rows } = await this.pool.query<UserRow>('SELECT * FROM users WHERE email = $1', [email]);
       return rows[0] ? UserRepository.toEntity(rows[0]) : null;
    }

    async findById(id: string): Promise<User | null> {
       const { rows } = await this.pool.query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
       return rows[0] ? UserRepository.toEntity(rows[0]) : null;
    }


    private static toEntity(row: UserRow): User {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            passwordHash: row.password_hash,
            createdAt: row.created_at,
        };
    }
}