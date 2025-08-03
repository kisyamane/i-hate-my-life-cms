import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import Navbar from "../components/NavBar";
import PostContainer from "../components/PostContainer";
import { Input } from "@headlessui/react";

export interface Post {
    id: number;
    slug: string;
    title: string;
    content: string;
    author: { nickname: string; avatar?: string };
}

export default function PostList({ mine }: { mine: boolean }) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const [queryParams, setQueryParams] = useState({
        search: '',
        page: 1,
    });

    const loader = useRef<HTMLDivElement>(null);
    const observer = useRef<IntersectionObserver>(null);
    const pageSize = 3;

    const fetchPosts = () => {
        if ((!hasMore) || loading) return;

        setLoading(true);
        
        API.get(`/api/posts?pageSize=${pageSize}&page=${queryParams.page}&search=${queryParams.search}`)
        .then((res) => {
            // Для первой страницы заменяем посты, для последующих - добавляем
            if (queryParams.page === 1) {
                setPosts(res.data.posts);
            } else {
                setPosts(prev => [...prev, ...res.data.posts]);
            }
            
            // Правильный расчёт hasMore: сравниваем с СЛЕДУЮЩЕЙ страницей
            setHasMore(res.data.total > pageSize * queryParams.page);
            
        })
        .catch(err => {
            console.error(err);
            setHasMore(false); // Сброс при ошибке
        })
        .finally(() => setLoading(false));
    };

    // Эффект для поиска
    useEffect(() => {
        const timeout = setTimeout(() => {
            // Полный сброс состояния при изменении поиска
            setPosts([]);
            setHasMore(true);
            setQueryParams({
                search: inputValue,
                page: 1 // Сбрасываем на первую страницу
            });
        }, 500);

        return () => clearTimeout(timeout);
    }, [inputValue]);

    // Эффект для загрузки данных
    useEffect(() => {
        fetchPosts();
    }, [queryParams]);

    // Эффект для бесконечного скролла
    useEffect(() => {
        if (!loader.current) return;
        
        if (observer.current) {
            observer.current.disconnect();
        }

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setQueryParams(prev => ({
                    ...prev,
                    page: prev.page + 1
                }));
            }
        });

        observer.current.observe(loader.current);

        return () => {
            observer.current?.disconnect();
        };
    }, [hasMore, loading, posts]); // Добавили posts в зависимости

    const removePostFromState = (postId: number) => {
        setPosts(posts.filter(post => post.id !== postId));
    };
    
    return (
        <div>
            <Navbar authorized={true} />
            <div className="pt-30 flex flex-col items-center gap-12">
                <h1 className="text-5xl">{mine ? 'Мои посты' : 'Посты'}</h1>
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-5xl h-12 border-gray-700 border-1 rounded-md pl-3 text-gray-700 focus:outline-none"
                />
                <div className="w-full flex flex-col gap-8 items-center">
                    {(mine
                        ? posts.filter(post => post.author.nickname === localStorage.getItem('nickname'))
                        : posts
                    ).map(post => (
                        <PostContainer
                            key={post.id}
                            post={post}
                            mine={mine}
                            removePostFromState={removePostFromState}
                        />
                    ))}
                </div>
                <div ref={loader} className="h-10"></div>
                {loading && <p className="text-gray-500">Загрузка...</p>}
                {!hasMore && posts.length > 0 && <p className="text-gray-400">Это всё!</p>}
            </div>
        </div>
    );
}