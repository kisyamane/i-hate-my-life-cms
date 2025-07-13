import jwt from "jsonwebtoken"
import { Response, Request, NextFunction } from "express"
import { error } from "console"

const JWT_SECRET = process.env.JWT_SECRET || 'required';

type DecodedToken = {
    id: number,
    email: string,
    role: string
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET) as DecodedToken;
        (req as any).user = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" })
    }

}