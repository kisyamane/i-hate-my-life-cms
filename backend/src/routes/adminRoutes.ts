import { Router } from "express"
import { requireRole } from "../middlewares/roleMiddleware";
import { authenticate } from "../middlewares/authMiddleware";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get('/users', authenticate, requireRole('ADMIN'), async(req, res) => {
    try {
        const users = await prisma.user.findMany();
        return res.status(200).json(users);
    } catch(err) {
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.get('/posts', authenticate, requireRole('ADMIN'), async(req, res) => {
    try {
        const posts = await prisma.post.findMany();
        return res.status(200).json(posts);
    } catch(err) {
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.put('/users/:id', authenticate, requireRole('ADMIN'), async(req, res) => {
    const userId = parseInt(req.params.id);

    try {
        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                role: 'ADMIN'
            }
        })
        return res.status(201).json(user);
    } catch(err) {
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.delete('/user/:id', authenticate, requireRole('ADMIN'), async(req, res) => {
    const userId = parseInt(req.params.id);

    try {
        await prisma.user.delete({
            where: {
                id: userId,
            }
        });
        return res.status(204).end();
    } catch(err) {
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.delete('/posts/:id', authenticate, requireRole('ADMIN'), async(req, res) => {
    const postId = parseInt(req.params.id);

    try {
        await prisma.post.delete({
            where: {
                id: postId,
            }
        });
        return res.status(204).end();
    } catch(err) {
        return res.status(500).json({ error: "Something went wrong" });
    }
});

export default router;
