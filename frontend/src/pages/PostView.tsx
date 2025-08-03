import { useEffect, useState } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar";
import type { Post } from "./PostList";
import { Link } from "react-router-dom";

export default function PostView() {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState({} as Post);

  useEffect(() => {
    API.get(`/api/posts/${slug}`)
      .then((res) => {
        setPost(res.data);
      })
      .catch(() => "Failed to fetch post");
  }, [slug]);

  return (
    <div className="min-h-screen">
      <Navbar authorized={true} />

      <div className="max-w-4xl mx-auto px-6 py-16 mt-10">
        <h1 className="text-4xl font-semibold text-gray-950 mb-6">{post.title}</h1>

        <div className="flex items-center gap-3 mb-8">
          <img
            src={post?.author?.avatar || "/default.jpg"}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border border-gray-300"
          />
          <Link
            to={`/user/${encodeURIComponent(post?.author?.nickname)}`}
            className="text-sm text-gray-800 font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {post?.author?.nickname || "Неизвестен"}
          </Link>
        </div>

        <article className="text-base text-gray-800 whitespace-pre-line">
          {post.content}
        </article>

        <hr className="my-12 border-gray-300" />

        <div className="text-gray-600 text-lg italic">
          Тут будут комментарии. Когда-нибудь.
        </div>
      </div>
    </div>
  );
}
