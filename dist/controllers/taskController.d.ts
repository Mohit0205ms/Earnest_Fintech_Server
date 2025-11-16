import { Request, Response, NextFunction } from 'express';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        email: string;
    };
}
export declare const getTasks: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const toggleTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteTask: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
