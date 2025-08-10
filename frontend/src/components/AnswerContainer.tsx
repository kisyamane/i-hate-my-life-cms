import type { Answer, Reaction } from "../types";
import { Link } from "react-router-dom";
import { AiFillDislike } from "react-icons/ai";
import { AiFillLike } from "react-icons/ai";
import { AiOutlineDislike } from "react-icons/ai";
import { AiOutlineLike } from "react-icons/ai";
import { useEffect, useState } from "react";
import API from "../services/api";


export default function AnswerContainer({ answer }: { answer: Answer }) {
    const [filled, setFilled] = useState<{ like: boolean, dislike: boolean }>({ like: false, dislike: false });
    const [reactions, setReactions] = useState<{ likes: number, dislikes: number }>({likes: 0, dislikes: 0});
    
    useEffect(() => {
        setReactions({
            dislikes: answer.reactions.filter(r => r.type === 'DISLIKE').length,
            likes: answer.reactions.filter(r => r.type === 'LIKE').length
        });

        const myReaction = answer.reactions.filter((r) => r.userId === parseInt(localStorage.getItem('id') as string))[0];


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
        API.delete(`api/answers/${answer.id}/react`)
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
        API.post(`api/answers/${answer.id}/react`, { type: r.type })
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

    return (
        <div key={answer.id} className="flex items-start gap-4 w-full">
            <img
            src={answer.author.avatar || "/default.jpg"}
            className="w-8 h-8 rounded-full object-cover"
            alt="Avatar"
            />
            <div className="flex flex-col items-start gap-1 bg-[#fffdf8] border border-[#f5ebd9] rounded-lg p-3 shadow-sm w-full transition hover:shadow-md">
                <div className="flex justify-between mb-1 w-full">
                    <Link 
                        to={`/user/${encodeURIComponent(answer.author.nickname)}`}
                        className="text-sm font-semibold text-gray-800 hover:underline"
                    >
                        {answer.author.nickname}
                    </Link>
                    <span className="text-xs text-gray-400">
                    {new Date(answer.createdAt).toLocaleString()}
                    </span>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{answer.content}</p>
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
            </div>
        </div>
    )
}