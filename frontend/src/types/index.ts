export type Reaction = { type: 'LIKE' | 'DISLIKE', userId?: number };

export interface Comment {
  id: number,
  content: string,
  createdAt: Date,
  author: {
    nickname: string,
    avatar?: string
  },
  reactions: Reaction[]
}

export interface Post {
    id: number;
    slug: string;
    title: string;
    content: string;
    author: { nickname: string; avatar?: string },
    reactions: Reaction[]
}

export interface Answer {
  id: number,
  content: string,
  createdAt: Date,
  author: {
    nickname: string,
    avatar?: string
  },
  reactions: Reaction[]
}