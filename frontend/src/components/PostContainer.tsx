import { useNavigate } from "react-router-dom"
import type { Post } from "../types";
import API from "../services/api";
import { useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import clsx from 'clsx'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { TiThMenu, TiTrash } from "react-icons/ti";
import { FaBrush } from "react-icons/fa";
import { Link } from "react-router-dom";

import { Input, Textarea, Button } from "@headlessui/react";

const schema = yup.object({
    title: yup.string().required("Обязательное поле"),
    content: yup.string().required("Обязательное поле")
});

export default function PostContainer({ post, mine, removePostFromState }: { post: Post, mine: boolean, removePostFromState: (postId: number) => void}) {
    const navigate = useNavigate();

    const [editMode, setEditMode] = useState(false);

    const {
          register,
          handleSubmit,
          reset,
          formState: { errors }
      } = useForm({
          resolver: yupResolver(schema),
          defaultValues: { title: post.title, content: post.content}
      });

    const removePost = async() => {
        try {
            await API.delete(`api/post/${post.id}`);
            removePostFromState(post.id);
        } catch(err) {
            alert("Failed to delete post");
        }
    }

    const editPost = async(data: {title: string, content: string}) => {
        try {
            await API.put(`/api/post/${post.id}`, data);
            post.title = data.title;
            post.content = data.content;
            setEditMode(false);
            reset();
        } catch(err) {
            alert("Failed to edit post")
        }
    }

    return (
        <div 
            key={post.id} 
            onClick={() => !editMode && navigate(`/posts/${post.slug}`)} 
            className="cursor-pointer transition-transform hover:scale-[1.01] bg-[#ffdea3] border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg max-w-7xl w-full flex flex-row justify-between"
        >
            {editMode ? 
            (<form className="space-y-2 w-full" onSubmit={handleSubmit(editPost)}>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#634b20]">
                        Название
                    </label>
                    <div className="relative">
                        <Input 
                            className={clsx(
                                'w-full h-12 border-[#634b20] border-1 rounded-md pl-3',
                                'focus:outline-none bg-[#fffbef]'
                            )}
                            {...register("title")}
                        />
                        {errors.title && (
                        <small className="text-sm text-red-500 absolute left-0 top-13">
                            {errors.title.message}
                        </small>
                        )}
                    </div>
                </div>
                    
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#634b20]">
                        Описание
                    </label>
                    <div className="relative">
                        <Textarea 
                            {...register("content")} 
                            className={clsx(
                                'w-full border-[#634b20] border-1 rounded-md pl-3 pt-3',
                                'focus:outline-none bg-[#fffbef]'
                            )}
                            rows={4}
                        />
                        {errors.content && (
                        <small className="text-sm text-red-500 absolute left-0 top-full mt-1">
                            {errors.content.message}
                        </small>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        onClick={() => { setEditMode(false) }}
                        className={clsx(
                            'px-4 py-2 rounded-md border-1 border-[#313131]',
                            'bg-[#ffdea3] hover:bg-[#fffbef] text-[#634b20]',
                            'transition-colors duration-200 cursor-pointer'
                        )}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        className={clsx(
                        'px-4 py-2 rounded-md text-white',
                        'bg-gray-950 hover:bg-gray-900',
                        'transition-colors duration-200 cursor-pointer'
                        )}
                    >
                        Опубликовать
                    </Button>
                </div>
            </form>) : 
            (<div className="space-y-2">
                <h2 className="text-2xl font-semibold text-[#634b20]">{post.title}</h2>
                <p className="text-gray-700">{post.content}</p>
                <div className="flex items-center gap-2 mt-4">
                    <img
                        src={post?.author?.avatar || "/default.jpg"}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <Link
                        to={`/user/${encodeURIComponent(post?.author?.nickname)}`}
                        className="text-sm text-gray-800 font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {post?.author?.nickname || "Неизвестен"}
                    </Link>
                </div>
            </div>)}
            <div className="self-center flex flex-row">
                <div>

                </div>
                {mine && !editMode && 
                    <div onClick={(e) => e.stopPropagation()} className="relative">
                        <Menu>
                            <MenuButton className="text-[#634b20] hover:text-[#3e2f16] p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffdea3]">
                                <TiThMenu className="text-xl size-8 cursor-pointer" />
                            </MenuButton>
                        
                            <MenuItems className="absolute right-0 mt-2 w-40 bg-[#fffaf3] border border-[#f1d9ac] rounded-lg shadow-lg z-10">
                                <MenuItem>
                                    <button
                                        className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-[#634b20] hover:bg-[#ffeccc] hover:rounded-t-lg`}
                                        onClick={() => setEditMode(true)}
                                    >
                                        <FaBrush className="text-md" />
                                        Редактировать
                                    </button>
                                </MenuItem>
                            
                                <MenuItem>
                                    <button
                                        className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:rounded-b-lg`}
                                        onClick={removePost}
                                    >
                                        <TiTrash className="text-md" />
                                        Удалить
                                    </button>
                                </MenuItem>
                            </MenuItems>
                        </Menu>
                </div>
            }
            </div>
        </div>
    );
}