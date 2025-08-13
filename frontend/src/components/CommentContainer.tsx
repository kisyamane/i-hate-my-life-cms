import { Link } from "react-router-dom"
import type { Answer, Comment, Reaction } from "../types"
import { AiFillDislike } from "react-icons/ai";
import { AiFillLike } from "react-icons/ai";
import { AiOutlineDislike } from "react-icons/ai";
import { AiOutlineLike } from "react-icons/ai";
import { useEffect, useState } from "react";
import API from "../services/api";
import { Button, Textarea } from "@headlessui/react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MdKeyboardArrowUp } from "react-icons/md";
import AnswerContainer from "./AnswerContainer";

export default function Comment({ comment }: {comment: Comment}) {
    const [filled, setFilled] = useState<{ like: boolean, dislike: boolean }>({ like: false, dislike: false });
    const [reactions, setReactions] = useState<{ likes: number, dislikes: number }>({likes: 0, dislikes: 0});
    const [letAnswer, setLetAnswer] = useState(false);
    const [newAnswer, setNewAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [showAnswers, setShowAnswers] = useState(false);
    const [firstAnswersLoaded, setfirstAnswersLoaded] = useState(false);
    const [answers, setAnswers] = useState<Answer[]>([]);

    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const pageSize = 4;

    const onAnswerSubmit = async() => {
        if (newAnswer !== '') {
            try {
                setLoading(true);
                const res = await API.post(`/api/comments/${comment.id}/answer`, { content: newAnswer });
                setAnswers(p => [res.data, ...p]);
                setLetAnswer(false);
            } catch(err) {
                console.log(err)
                alert('Failed to post answer')
            } finally {
                setLoading(false);
            }
        }
    }

    const loadAnswers = async() => {
        try {
            setLoading(true);
            const res = await API.get(`/api/comments/${comment.id}/answers?page=${page}&pageSize=${pageSize}`);
            console.log(res.data)
            setAnswers(p => [...p, ...res.data.answers]);
            setPage(p => p + 1)
            setHasMore(res.data.hasMore);
            setShowAnswers(true);
            setfirstAnswersLoaded(true);
        } catch(err) {
            console.log(err)
            alert('Failed to load answers')
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setReactions({
            dislikes: comment.reactions.filter(r => r.type === 'DISLIKE').length,
            likes: comment.reactions.filter(r => r.type === 'LIKE').length
        });

        const myReaction = comment.reactions.filter((r) => r.userId === parseInt(localStorage.getItem('id') as string))[0];


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
    }, [])

    const deleteReaction = (r: Reaction) => {
        API.delete(`api/comments/${comment.id}/react`)
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
        API.post(`api/comments/${comment.id}/react`, { type: r.type })
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

    return  (
        <div key={comment.id} className="flex items-start gap-4">
            <img
            src={comment.author.avatar || "/default.jpg"}
            className="w-10 h-10 rounded-full object-cover"
            alt="Avatar"
            />
            <div className="flex flex-col items-start gap-1 bg-[#fff8ec] border border-[#f3e3c2] rounded-xl p-4 shadow-sm w-full transition hover:shadow-md">
                <div className="flex justify-between w-full mb-1">
                    <Link 
                        to={`/user/${encodeURIComponent(comment.author.nickname)}`}
                        className="text-sm font-semibold text-gray-800 hover:underline"
                    >
                        {comment.author.nickname}
                    </Link>
                    <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                    </span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
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
                    <Button 
                        className="cursor-pointer text-sm pl-4 text-[#634b20] hover:text-amber-500 font-semibold hover:underline"
                        onClick={() => letAnswer ? setLetAnswer(false) : setLetAnswer(true)}
                    >
                        Ответить
                    </Button>
                </div>
                {letAnswer && (
                    <div className="flex flex-row items-end gap-4 w-full mt-2">
                        <Textarea 
                            className="w-full overflow-hidden border-b focus:border-gray-600 border-gray-300 p-1 text-gray-800 resize-none focus:outline-none"
                            placeholder="Введите ответ..."
                            rows={1}
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = "auto"; 
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                        />
                        <Button
                            onClick={onAnswerSubmit}
                            disabled={loading}
                            className="cursor-pointer text-sm px-4 py-2 rounded bg-gray-950 text-white font-medium hover:bg-gray-800 transition"
                        >
                            Ответить
                        </Button>
                    </div>
                )}
                <Button 
                    className="cursor-pointer mt-3 bg-[#ffdea3] hover:opacity-85 transition text-gray-950 font-medium pr-4 pl-3 py-2 flex flex-row items-center  rounded-full"
                    onClick={() => {
                        firstAnswersLoaded
                         ? (showAnswers ? setShowAnswers(false) : setShowAnswers(true))
                         : loadAnswers()
                    }}
                    disabled={loading}
                >
                    { showAnswers ? <MdKeyboardArrowUp className="text-xl" /> : <MdKeyboardArrowDown className="text-xl"/> }
                    <span className="text-md font-medium">Ответы</span>
                </Button>
                { showAnswers &&
                    <section className="w-full pt-6 flex flex-col gap-4 items-end">
                        {answers.map(answer => (
                            <AnswerContainer answer={answer} />
                        ))}
                        {hasMore && 
                            <Button
                                onClick={loadAnswers}
                                className="rounded-full bg-[#ffdea3] px-4 py-2 text-gray-950 font-medium text-md cursor-pointer hover:opacity-85"
                            >
                                Далее
                            </Button>
                        }
                    </section>
                }
            </div>
        </div>
    )
}