import express from 'express'
import { authenticate } from '../middlewares/authMiddleware'
import { PrismaClient } from '@prisma/client';
import { error } from 'console';
import slugify from 'slugify';


const router = express.Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends express.Request {
    user: { id: number, email: string } // или точный тип юзера
  }
  

router.get('/profile', authenticate, (req: AuthenticatedRequest, res) => {
    res.json({user: (req as any).user});
});

router.get('/posts', authenticate, async(req: AuthenticatedRequest, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });

        return res.status(200).json(posts);
    } catch(err) {
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.get('/posts/:slug', authenticate, async(req: AuthenticatedRequest, res) => {
    const { slug } = req.params;

    try {
        const post = await prisma.post.findUnique({
            where: {slug},
            include: {
                author: {
                    select: {
                        id: true,
                        email: true
                    }
                }
            }
        });

        if (!post) {
            return res.status(404).json({error: "Post doesn't exist"});
        }

        res.status(200).json(post);
    } catch(err) {
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.post('/new-post', authenticate, async (req: AuthenticatedRequest, res) => {
    // Получаем данные из тела запроса
    const { title, content } = req.body;
    const userId = req.user.id;
    
    if (!userId || !content || !title || !content) {
        return res.status(400).json({ error: {}});
    }
    
    try {
        // Ищем пользователя с await
        const author = await prisma.user.findUnique({
            where: { id: userId }
        });
    
        if (!author) {
            return res.status(404).json({ error: "User not found" }); 
        }
    
        const slug = slugify(title, {lower: true, strict: true}); 
        
        const post = await prisma.post.create({
            data: {
                title: title,
                content: content,
                slug: slug, 
                authorId: userId 
            }
        });
    
        return res.status(201).json(post); 
    } catch(err) {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.put('/post/:id', authenticate, async(req: AuthenticatedRequest, res) => {
    const postId = parseInt(req.params.id);

    const {title, content} = req.body;

    try{
        const exists = await prisma.post.findUnique({
            where: {
                id: postId
            }
        });

        if (!exists) {
            return res.status(404).json({error: "Post not found"});
        }

        if (exists.authorId != req.user.id) {
            return res.status(403).json({error: "You can only modify your own posts"});
        }

        const updateData: {title?: string, content?: string} = {};

        if (title !== undefined) {
            updateData.title = title;
        }

        if (content !== undefined) {
            updateData.content = content
        }

        const post = await prisma.post.update({
            where: {
                id: postId,
            },
            data: updateData
        });
        
        return res.status(201).json(post);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong" });
    }

    
});

router.delete('/post/:id', authenticate, async(req: AuthenticatedRequest, res) => {
    const postId = parseInt(req.params.id);

    try {
        const exists = await prisma.post.findUnique({
            where: {
                id: postId
            }
        });

        if (!exists) {
            return res.status(404).json({error: "Post not found"});
        }

        if (exists.authorId != req.user.id) {
            return res.status(403).json({error: "You can only delete your own posts"});
        }

        await prisma.post.delete({
            where: {
                id: postId
            }
        });

        return res.status(204).end();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
})


export default router;