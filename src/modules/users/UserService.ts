import { UserNotFoundError } from '../../errors/UserNotFoundError';
import { UserAlreadyExistsError } from '../../errors/UserAlreadyExistsError';
import { IPasswordService } from '../../shared/password/IPasswordService';
import { IUserRepository, PublicUser, User } from './IUserRepository';


export interface RegisterUserData {
    name: string;
    email: string;
    password: string;
}

export class  UserService {
    // INJEÇÃO DE DEPENDÊNCIA + ENCAPSULAMENTO: dependências privadas e readonly,
   // recebidas por interface (fácil de trocar por mock nos testes).
   constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
   ) {}

   async register(data:  RegisterUserData): Promise<PublicUser> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw new UserAlreadyExistsError();

    const passwordHash = await this.passwordService.hash(data.password);
    const user = await this.userRepository.create({
        name: data.name,
        email: data.email,
        passwordHash,
    });

    return UserService.toPublic(user);
   }

   async getProfile(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new UserNotFoundError();
    return UserService.toPublic(user);
   }

   static toPublic(user: User): PublicUser {
    const { passwordHash: _omit, ...publicUser } = user;
    return publicUser
   }
}