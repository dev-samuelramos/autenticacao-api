/**
 * Classe base de erros HTTP.
 * POLIMORFISMO: o middleware global trata qualquer subclasse como AppError
 * e usa o statusCode que cada uma define.
 */

export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 400,
    ) {
        super(message);
        this.name = new.target.name
       Object.setPrototypeOf(this, new.target.prototype);
    }
}