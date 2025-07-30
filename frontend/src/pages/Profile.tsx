import { useEffect, useRef, useState } from "react";
import Navbar from "../components/NavBar";
import { Button, Input } from "@headlessui/react";
import API from "../services/api";
import clsx from 'clsx'
import { FaFileUpload } from "react-icons/fa";
import type { Post } from "./PostList";
import PostContainer from "../components/PostContainer";


export default function Profile() {
    const [email, setEmail] = useState(''); 
    const [avatar, setAvatar] = useState<string | null>(null);
    const [nickname, setNickname] = useState(''); 
    const [role, setRole] = useState(''); 
    const [editMode, setEditMode] = useState(false);
    const [posts, setPosts] = useState([] as Post[])
    
    const initialProfileData = useRef<{nickname: string, avatar: string | null}>({
        nickname: '',
        avatar: '',
    });
    
    const removePostFromState = (postId: number) => {
        setPosts(posts.filter(post => post.id !== postId));
    }

    useEffect(() => {
        API.get('/api/me')
        .then(res => {
            setEmail(res.data.email);
            setAvatar(res.data.avatar);
            setNickname(res.data.nickname ?? `User-${res.data.id}`);
            setRole(res.data.role);
            setPosts(res.data.posts);

            initialProfileData.current.avatar = res.data.avatar;
            initialProfileData.current.nickname = res.data.nickname;
        })
        .catch(err => alert('Failed to fetch profile data'));
    }, []);

    const handleCancel = () => {
        setEditMode(false);
        setNickname(initialProfileData.current.nickname);
        setAvatar(initialProfileData.current.avatar);
    }

    const handleUpload = async(e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        const res = await API.post('api/me/avatar', formData);
        setAvatar(res.data.avatar);
    }

    const handleUpdate = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            await API.put('/api/me', {avatar, nickname});
            setEditMode(false);
        } catch(err) {
            alert("Failed to update");
        }

    }

    return (
        <div className="min-h-screen">
            <Navbar authorized={true} />
            <div className="pt-24 flex flex-col items-center gap-12">
                <div className="w-full flex min-h-screen h-full flex-col gap-8 items-center px-4">
                    {editMode ? (
                        <form className="bg-white w-full max-w-4xl rounded-2xl p-10 shadow-xl flex flex-col gap-6" onSubmit={e => handleUpdate(e)}>
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="relative group cursor-pointer">
                                <img
                                    src={avatar || './public/default.jpg'}
                                    alt="Profile picture"
                                    className="w-48 h-48 object-cover rounded-xl shadow-md border border-gray-200 relative z-0"
                                />
                                <div className="absolute opacity-0 group-hover:bg-black group-hover:opacity-70 inset-0 rounded-xl flex items-center justify-center transition-opacity duration-200">
                                    <FaFileUpload className="w-12 h-12 text-white opacity-0 group-hover:opacity-70 transition-opacity duration-200" />
                                </div>
                                <input type="file" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" onChange={handleUpload}/>
                            </div>
                                <div className="flex flex-col gap-3 w-full">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-500">
                                            Nickname
                                        </label>
                                        <Input 
                                            className={clsx(
                                                'w-full h-12 border-gray-700 border-1 rounded-md pl-3 text-gray-700',
                                                'focus:outline-none'
                                            )}
                                            value={nickname}
                                            onChange={(e) => setNickname(e.target.value)}
                                        />
                                    </div>
    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                        <p className="text-lg font-medium text-gray-700">{email ?? '...'}</p>
                                    </div>
    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                                        <p className="text-lg text-gray-700">{role ?? '...'}</p>
                                    </div>
                                </div>
                            </div>
    
                            <div className="flex justify-end gap-4">
                                <Button
                                    type="button"
                                    onClick={handleCancel}
                                    className={clsx(
                                    'px-4 py-2 rounded-lg border-1 border-gray-700',
                                    'bg-red-400 hover:bg-red-300 text-gray-950',
                                    'transition-colors duration-200 cursor-pointer'
                                    )}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    className='px-4 py-2 rounded-lg text-white bg-gray-950 hover:bg-gray-700 transition-colors duration-200 cursor-pointer'
                                    type="submit"
                                >
                                    Сохранить
                                </Button>
                            </div>    
                        </form>
                    ) : (
                        <div className="bg-white w-full max-w-4xl rounded-2xl p-10 shadow-xl flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                <img
                                    src={avatar || './public/default.jpg'}
                                    alt="Profile picture"
                                    className="w-48 h-48 object-cover rounded-xl shadow-md border border-gray-200"
                                />
                                <div className="flex flex-col gap-3 w-full">
                                    <h1 className="text-4xl font-semibold text-gray-800">{nickname ?? '...'}</h1>
    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                        <p className="text-lg font-medium text-gray-700">{email ?? '...'}</p>
                                    </div>
    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                                        <p className="text-lg text-gray-700">{role ?? '...'}</p>
                                    </div>
                                </div>
                            </div>
    
                            <div className="flex justify-end">
                                <Button
                                    className="px-6 py-2 text-white bg-gray-950 hover:bg-gray-700 font-medium rounded-lg transition duration-200 cursor-pointer"
                                    onClick={() => setEditMode(true)}
                                >
                                    Редактировать
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className="bg-white w-full max-w-4xl rounded-2xl p-10 shadow-xl flex flex-col gap-6 justify-center items-center">
                        <h1 className="text-4xl mb-4">Последние посты</h1>
                        <div className="w-full flex flex-col gap-8 items-center">
                            {posts.map((post: Post) => (
                                <PostContainer post={post} mine={true} removePostFromState={removePostFromState} key={post.id}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    
}