import { useEffect, useState } from "react";
import API from "../services/api";
import Navbar from "../components/NavBar";
import PostContainer from "../components/PostContainer";

export interface Post {
    id: number,
    slug: string, 
    title: string, 
    content: string, 
    author: {email?: string}
}

export default function PostList({mine}: {mine: boolean}) {

    const [posts, setPosts] = useState([] as Post[]);

    const removePostFromState = (postId: number) => {
        setPosts(posts.filter(post => post.id !== postId));
    }

    useEffect(() => {
        try {
            if (mine) {
                API.get('/api/my-posts')
                .then(res => setPosts(res.data))
                .catch(() => alert("Failed to fetch posts"));
            } else {
                API.get('/api/posts')
                .then(res => setPosts(res.data))
                .catch(() => alert("Failed to fetch posts"));
            }
        } catch(err) {
            alert("Failed to fetch posts")
        }
    }, []);

    return (
        <div>
            <Navbar authorized={true}/>
            <div className="pt-30 flex flex-col items-center gap-12">
                <h1 className="text-5xl">{mine ? 'Мои посты' : 'Посты'}</h1>
                <div className="w-full flex flex-col gap-8 items-center">
                    {posts.map((post: Post) => (
                        <PostContainer post={post} mine={mine} removePostFromState={removePostFromState} key={post.id}/>
                    ))}
                </div>
            </div>
        </div>
    );
}

