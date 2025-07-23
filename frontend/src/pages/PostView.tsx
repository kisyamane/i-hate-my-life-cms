import { useEffect, useState } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar";

export default function PostView() {
  const { slug } = useParams<{ slug: string }>();

  interface PostView {
    content: string;
    title: string;
    author: {
      id: number;
      email: string;
    };
  }

  const [post, setPost] = useState({} as PostView);

  useEffect(() => {
    API.get(`/api/posts/${slug}`)
      .then((res) => {
        setPost(res.data);
      })
      .catch(() => "Failed to fetch post");
  }, [slug]);

  return (
    <div>
        <Navbar />
        <div className={styles.container}>
            <h1 className={styles.title}>{post?.title}</h1>
            <p className={styles.content}>{post?.content}</p>
            <div className={styles.author}>Автор: {post?.author?.email}</div>
        </div>
    </div>
  );
}
