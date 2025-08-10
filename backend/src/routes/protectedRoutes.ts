import express from 'express'
import { authenticate } from '../middlewares/authMiddleware'
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';
import multer from 'multer';
import { storage } from '../cloudinary';



const router = express.Router();
const prisma = new PrismaClient();

interface AuthenticatedRequest extends express.Request {
    user: { 
        id: number, 
        email: string 
    },
    file?: Express.Multer.File
  }
  

router.get('/profile', authenticate, (req: AuthenticatedRequest, res) => {
    res.json({user: (req as AuthenticatedRequest).user});
});

router.get('/posts', authenticate, async(req: AuthenticatedRequest, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 5;
    const search = req.query.search as string || '';


    try {
        const posts = await prisma.post.findMany({
            where: search
                ? {
                      OR: [
                          {
                              title: {
                                  contains: search,
                                  mode: 'insensitive'
                              }
                          },
                          {
                              content: {
                                  contains: search,
                                  mode: 'insensitive'
                              }
                          }
                      ]
                  }
                : {},
            orderBy: {
                createdAt: 'desc'
            },
            take: pageSize,
            skip: (page - 1) * pageSize, 
            include: {
                author: {
                    select: {
                        id: true,
                        nickname: true,
                        avatar: true
                    }
                }
            }
        });

        const total = await prisma.post.count({
            where: search
                ? {
                      OR: [
                          {
                              title: {
                                  contains: search,
                                  mode: 'insensitive'
                              }
                          },
                          {
                              content: {
                                  contains: search,
                                  mode: 'insensitive'
                              }
                          }
                      ]
                  }
                : {}
        });

        return res.status(200).json({
            posts,
            page,
            pageSize,
            total
        });
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
                        nickname: true,
                        avatar: true
                    }
                },
                reactions: {
                    select: {
                        type: true,
                        userId: true
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

const generateUniqueSlug = async(title: string) => {
    let baseSlug = slugify(title, {lower: true, strict: true});
    let count = 0;
    let slug = baseSlug;

    while (await prisma.post.findUnique({
        where: {
            slug
        }
    })) {
        slug = `${baseSlug}-${count}`
        count++;
    }

    return slug;
}

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
    
        const slug = await generateUniqueSlug(title); 
        
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
});

router.get('/user/:nickname', authenticate, async(req: AuthenticatedRequest, res) => {
    const nickname = req.params.nickname;

    try {
        const user = await prisma.user.findUnique({
            where: {
                nickname
            },
            select: {
                id: true,
                avatar: true,
                nickname: true,
                email: true,
                role: true,
                posts: {
                    select: {
                        title: true,
                        content: true,
                        slug: true,
                        author:  {
                            select: {
                                nickname: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 3
                }
            },
        });
    
        return res.status(200).json(user);        
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
})

router.put('/me', authenticate, async(req: AuthenticatedRequest, res) => {
    const userId = req.user.id;
    const { avatar, nickname } = req.body;

    const exists = await prisma.user.findUnique({
        where: {
            nickname
        }
    });

    if (exists && exists.id !== userId) {
        return res.json({error: "Никнейм уже используется"});
    }

    try {
        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                avatar,
                nickname
            }
        });
    
        return res.status(201).json(user);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

const upload = multer({ storage });

router.post('/me/avatar', upload.single('avatar'), authenticate, async(req: AuthenticatedRequest, res) => {
    const file = req.file as Express.Multer.File & { path: string }

    try {
        const cloudinaryUrl = file.path;
        res.status(201).json({ avatar: cloudinaryUrl });
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
})

router.get('/posts/:slug/comments', authenticate, async(req: AuthenticatedRequest, res) => {
    const slug = req.params.slug;

    try {
        const post = await prisma.post.findUnique({
            where: {
                slug
            }
        });

        if (!post) {
            return res.status(404).json({error: 'Post not found'})
        }

        const comments = await prisma.comment.findMany({
            where: {
                postId: post.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                author: {
                    select: {
                        nickname: true,
                        avatar: true
                    }
                },
                reactions: {
                    select: {
                        type: true,
                        userId:true
                    }
                }
            }
        });

        return res.status(200).json(comments);
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.post('/posts/:slug/comments', authenticate, async(req: AuthenticatedRequest, res) => {
    const slug = req.params.slug;
    const content = req.body.content;

    const post = await prisma.post.findUnique({
        where: { slug },
    })

    if (!post) {
        return res.status(404).json({error: 'Post not found'})
    }

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                postId: post.id,
                authorId: req.user.id
            },
            include:{
                author: {
                    select: {
                        nickname: true,
                        avatar: true
                    }
                },
                reactions: true
            }
        })

        return res.status(201).json(comment);
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.post('/posts/:postId/react', authenticate, async(req: AuthenticatedRequest, res) => {
    const userId = req.user.id;
    const postId = parseInt(req.params.postId);
    const { type } = req.body;

    try {
        const reaction = await prisma.postReaction.upsert({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            },
            update: {
                type
            },
            create: {
                userId,
                type,
                postId
            }
        })
        console.log(reaction)
        return res.status(201).json(reaction);
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.post('/comments/:commentId/react', authenticate, async(req: AuthenticatedRequest, res) => {
    const { commentId } = req.params;
    const { type } = req.body;

    try {
        const reaction = await prisma.commentReaction.upsert({
            where: {
               userId_commentId: {
                commentId: parseInt(commentId),
                userId: req.user.id
               } 
            },
            update: { type },
            create: {
                type,
                commentId: parseInt(commentId),
                userId: req.user.id
            }
        })


        return res.status(201).json(reaction);
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.delete('/posts/:postId/react', authenticate, async(req: AuthenticatedRequest, res) => {
    const { postId } = req.params;

    try {
        const reaction = await prisma.postReaction.findUnique({
            where: {
                userId_postId: {
                    userId: req.user.id,
                    postId: parseInt(postId)
                }
            }
        });

        if (!reaction) {
            return res.status(404).json({ error: 'Reaction not found' });
        }

        await prisma.postReaction.delete({
            where: {
                id: reaction.id
            }
        })

        return res.status(204).end();
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.delete('/comments/:commentId/react', authenticate, async(req: AuthenticatedRequest, res) => {
    const { commentId } = req.params;

    try {
        const reaction = await prisma.commentReaction.findUnique({
            where: {
                userId_commentId: {
                    commentId: parseInt(commentId),
                    userId: req.user.id
                }
            },
        });



        if (!reaction) {
            return res.status(404).json({ error: 'Reaction not found' });
        }

        await prisma.commentReaction.delete({
            where: {
                id: reaction.id
            }
        })

        return res.status(204).end();
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.post('/comments/:commentId/answer', authenticate, async(req: AuthenticatedRequest, res) => {
    const commentId = parseInt(req.params.commentId);
    const { content } = req.body;

    try {
        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId
            }
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const reaction = await prisma.answer.create({
            data: {
                content,
                authorId: req.user.id,
                commentId
            },
            include: {
                author: {
                    select: {
                        nickname: true,
                        avatar: true
                    },
                },
                reactions: true
            }
        })


        return res.status(201).json(reaction);
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.get('/comments/:commentId/answers', authenticate, async(req: AuthenticatedRequest, res) => {
    const commentId = parseInt(req.params.commentId);

    try {
        const comment = await prisma.comment.findUnique({
            where: {
                id: commentId
            }
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const answers = await prisma.answer.findMany({
            where: {
                commentId
            },
            include: {
                author: {
                    select: {
                        nickname: true,
                        avatar: true
                    }
                },
                reactions: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 4
        });

        return res.status(200).json(answers);
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.post('/answers/:answerId/react', authenticate, async(req: AuthenticatedRequest, res) => {
    const answerId = parseInt(req.params.answerId);
    const { type } = req.body;

    try {
        const reaction = await prisma.answerReaction.upsert({
            where: {
               userId_answerId: {
                answerId: answerId,
                userId: req.user.id
               } 
            },
            update: { type },
            create: {
                type,
                answerId,
                userId: req.user.id
            }
        })


        return res.status(201).json(reaction);
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});

router.delete('/answers/:answerId/react', authenticate, async(req: AuthenticatedRequest, res) => {
    const answerId = parseInt(req.params.answerId);

    try {
        const reaction = await prisma.answerReaction.findUnique({
            where: {
                userId_answerId: {
                    userId: req.user.id,
                    answerId
                }
            }
        });

        if (!reaction) {
            return res.status(404).json({ error: 'Reaction not found' });
        }

        await prisma.answerReaction.delete({
            where: {
                id: reaction.id
            }
        })

        return res.status(204).end();
    } catch(err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
    }
});




export default router;