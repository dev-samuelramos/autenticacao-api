/** ABSTRAÇÃO: quem usa senhas depende deste contrato, não do bcrypt. */


export interface IPasswordService {
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
}