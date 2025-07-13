import { useEffect, useState } from "react";
import API from "../services/api";
import styles from "./PostList.module.css"; 
import Navbar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

export default function PostList() {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        API.get('/api/posts')
            .then(res => setPosts(res.data))
            .catch(() => alert("Failed to fetch posts"));
    }, []);

    return (
        <div>
            <Navbar />
            <div className={styles.pageContainer}>
                <h1 className={styles.pageTitle}>Posts</h1>
                <div className={styles.postsList}>
                    {posts.map((post: any) => (
                        <div className={styles.postCard} key={post.slug} onClick={() => navigate(`${post.slug}`)}>
                            <h2 className={styles.postTitle}>{post.title}</h2>
                            <p className={styles.postContent}>{post.content}</p>
                            <small className={styles.postAuthor}>Author: {post.author?.email}</small>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
