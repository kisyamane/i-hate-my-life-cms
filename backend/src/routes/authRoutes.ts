import { PrismaClient } from '@prisma/client';
import { register, login } from '../controllers/authController';
import express from 'express';
import bcrypt from "bcrypt";
import transporter from '..';

const router =  express.Router();
const prisma = new PrismaClient();

router.post('/register', register);
router.post('/login', login);

router.post('/forgot-password', async(req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });
    
        if (!user) {
            return res.status(200).json({ message: "If user exist, email has been sent" });
        }

        const alreadyExists = await prisma.passwordResetToken.findUnique({where: {userId: user.id}});

        if (alreadyExists) {
            await prisma.passwordResetToken.delete({where: {userId: user.id}});
        }
    
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
    
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt
            }
        });
    
        const resetLink = `http://localhost:5173/reset-password/${token}`;

        await transporter.sendMail({
            from: 'MyCms',
            to: user.email,
            subject: "Сброс пароля",
            html: `Для сброса пароля перейдите по ссылке <a>${resetLink}</a>`, // HTML body
        });
    
        console.log(`Password reset link: ${resetLink}`);
    
        return res.status(200).json({message: "Reset link sent"});
    } catch(err) {
        return res.status(500).json({ error: "Something went wrong" });
    }
    
});

router.post('/reset-password', async(req, res) => {
    interface ResetToken {
        userId: number,
        token: string,
        expiresAt: Date
    }


    const { token, newPassword } = req.body;
    console.log(token, newPassword)

    try {
        const resetToken = await prisma.passwordResetToken.findUnique({where: {token}}) as ResetToken;
    
        if (!resetToken || resetToken.expiresAt < new Date()) {
            return res.status(400).json({error: "Token is invalid or expired"});
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: {
                id: resetToken.userId
            },
            data: {
                password: hashed
            }
        });

        await prisma.passwordResetToken.delete({
            where: {token}
        });

        return res.status(200).json("Password updated");
    } catch(err) {
        return res.status(500).json({ error: "Something went wrong", err });
    }
})

export default router;