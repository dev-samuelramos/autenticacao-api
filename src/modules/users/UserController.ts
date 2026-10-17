import { Request, Response } from 'express';
import { RegisterInput } from './user.schema';
import { UserService } from './UserService';


// O controller só lida com REQ e RES; regra de negócio fica no Service.
export class  UserController {
    constructor(private readonly userService: UserService) {}


    register = async (req: Request, res:Response): Promise<void> => {
        const {name, email, password} = req.body as RegisterInput;
        const user = await this.userService.register({name, email,password});
        res.status(201).json({user});
    };

    me = async (req: Request, res: Response): Promise<void> => {
        const user = await this.userService.getProfile(req.user!.id);
        res.status(200).json({user});
    };
}