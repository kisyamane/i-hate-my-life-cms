import { Response, Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient;
const JWT_SECRET = process.env.JWT_SECRET || 'required';

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            return res.status(400).json({ error: "User with such email already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: {email, password: hashed} });
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                nickname: `User-${user.id}`
            }
        });

        res.status(201).json({ message: "Ok"});
    } catch (err) {
        return res.status(500).json({ error: "Internal server error", err});
    }
}

export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    try {
        const user = await prisma.user.findUnique({ where: {email} });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const jwt_sign = jwt.sign({ id: user.id, email: user.email, password: user.password }, JWT_SECRET, {
            expiresIn: "7d"
        });

        return res.status(201).json({ jwt_sign, nickname: user.nickname, id: user.id });
    } catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
}