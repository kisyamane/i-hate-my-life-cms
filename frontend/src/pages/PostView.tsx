import React, { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import Navbar from "../components/NavBar";
import type { Post, Comment, Reaction } from "../types";
import { Link } from "react-router-dom";
import { Textarea, Button } from "@headlessui/react";
import CommentContainer from "../components/CommentContainer";
import { AiFillDislike } from "react-icons/ai";
import { AiFillLike } from "react-icons/ai";
import { AiOutlineDislike } from "react-icons/ai";
import { AiOutlineLike } from "react-icons/ai";

export default function PostView() {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState({} as Post);
  const [comments, setComments] = useState<Comment[]>([])

  const [filled, setFilled] = useState<{ like: boolean, dislike: boolean }>({ like: false, dislike: false });
  const [reactions, setReactions] = useState<{ likes: number, dislikes: number }>({likes: 0, dislikes: 0})

  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const loader = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const pageSize = 4;

  useEffect(() => {
    if (!loader.current) {
      return
    }

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !commentsLoading && hasMore) {
        setPage(p => p + 1);
      }
    });

    observer.current.observe(loader.current);

    return () => observer.current?.disconnect()
  }, [page, hasMore, commentsLoading, loader]);

  useEffect(() => {
    setCommentsLoading(true);
    API.get(`/api/posts/${slug}/comments?page=${page}&pageSize=${pageSize}`)
    .then((res) => {
      if (page === 0) {
        setComments(res.data.comments);
      } else {
        setComments(p => [...p, ...res.data.comments]);
      }
      setHasMore(res.data.hasMore);
    })
    .catch(err => alert('Failed to load comments'))
    .finally(() => setCommentsLoading(false));
  }, [page]);


  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    API.post(`/api/posts/${slug}/comments`, { content: newComment })
    .then((res) => {
      setComments(p => [res.data, ...p])
    })
    .catch(err => alert('Failed to save post'))
    .finally(() => setLoading(false));
  }

  useEffect(() => {
    setLoading(true);
    API.get(`/api/posts/${slug}`)
      .then((res) => {
        setPost(res.data);
        setReactions({
          dislikes: (res.data.reactions as Reaction[]).filter(r => r.type === "DISLIKE").length,
          likes: (res.data.reactions as Reaction[]).filter(r => r.type === "LIKE").length
        });

        const myReaction = (res.data.reactions as Reaction[]).filter((r) => r.userId === parseInt(localStorage.getItem('id') as string))[0];

        if (myReaction) {
            switch(myReaction.type) {
                case 'LIKE':
                    setFilled({like: true, dislike: false});
                    break;
                case "DISLIKE":
                    setFilled({like: false, dislike: true});
                    break;
            }
        }
      })
      .catch(() => "Failed to fetch post")
      .finally(() => setLoading(false));
  }, []);

  const deleteReaction = (r: Reaction) => {
      API.delete(`api/posts/${post.id}/react`)
      .catch(err => alert('Failed to delete reaction'))
      .finally(() => {
          setFilled({like: false, dislike: false});
          switch(r.type) {
              case 'LIKE':
                  setReactions(p => ({...p, likes: p.likes - 1}))
                  break;
              case "DISLIKE":
                  setReactions(p => ({...p, dislikes: p.dislikes - 1}))
                  break;
          }
      });
  }

  const changeReaction = (r: Reaction) => {
      API.post(`api/posts/${post.id}/react`, { type: r.type })
      .catch(err => alert('Failed to add reaction'))
      .finally(() => {
          switch(r.type) {
              case 'LIKE':
                  filled.dislike
                    ? setReactions(p => ({dislikes: p.dislikes - 1, likes: p.likes + 1}))
                    : setReactions(p => ({...p, likes: p.likes + 1}))
                  setFilled({like: true, dislike: false});
                  break;
              case "DISLIKE":
                  filled.like
                    ? setReactions(p => ({dislikes: p.dislikes + 1, likes: p.likes - 1}))
                    : setReactions(p => ({...p, dislikes: p.dislikes + 1}))
                  setFilled({like: false, dislike: true});
                  break;
          }
      })
  }

  const addCommentToState = (comment: Comment) => {
    setComments(p => [...p, comment])
  }


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

        <div className="flex flex-row mt-2 text-xl gap-3 text-gray-700">
          <div className="flex flex-row items-center gap-0.5">
            { filled.like
              ? <AiFillLike 
                className="cursor-pointer"
                onClick={() => deleteReaction({ type: 'LIKE' })}
              />
              : <AiOutlineLike 
                className="cursor-pointer"
                onClick={() => changeReaction({type: 'LIKE'})}
              />
            }
            <span className="text-lg">{reactions.likes}</span>
          </div>
          <div className="flex flex-row items-center gap-0.5">
            { filled.dislike
              ? <AiFillDislike 
                className="cursor-pointer"
                onClick={() => deleteReaction({ type: 'DISLIKE' })} 
              />
              : <AiOutlineDislike 
                className="cursor-pointer"
                onClick={() => changeReaction({ type: 'DISLIKE' })}
              />
            }
            <span className="text-lg">{reactions.dislikes}</span>
          </div>
        </div>

        <hr className="my-12 border-gray-300" />

        <section>
          <h2 className="text-2xl font-semibold mb-4">Комментарии: </h2>
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <Textarea 
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 resize-none focus:outline-none"
              placeholder="Оставьте комментарий..."
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto"; // сброс
                  target.style.height = `${target.scrollHeight}px`; // подгон под контент
              }
            }
            />
            <Button 
              className="cursor-pointer mt-5 bg-gray-950 hover:bg-gray-800 transition text-white font-medium px-4 py-2 rounded disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              Отправить
            </Button>
          </form>
          <div className="flex flex-col gap-6 mt-10">
            {comments.length === 0
            ? (
              <p>Здесь пусто.</p>
            ) 
            : comments.map(comment => (
              <CommentContainer comment={comment} />
            ))
            }
          </div>
          <div className="h-10" ref={loader}></div>
        </section>
      </div>
    </div>
  );
}
