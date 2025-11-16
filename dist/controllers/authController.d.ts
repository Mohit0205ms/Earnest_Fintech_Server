import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}
export declare const register: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const refresh: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const logout: (req: Request, res: Response) => void;
export {};
