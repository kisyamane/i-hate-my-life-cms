import { Request, Response, NextFunction } from "express";

export function requireRole(role: 'ADMIN' | 'USER') {
    return (req: Request, res: Response, next: NextFunction) => {
        
        const user = (req as any).user;

        if (!user || role !== user.role) {
            return res.status(403).json({error: "Access denied"});
        }

        next();
    }
}