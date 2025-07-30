import { Link } from "react-router-dom";
import CreatePostModal from "./CreatePostModal";
import { useEffect, useState } from "react";
import API from "../services/api";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from "react";

export default function Navbar({ authorized }: { authorized: boolean }) {

  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<string>('');

  useEffect(() => {
    API.get('api/me')
    .then(res => {
      setNickname(res.data.nickname);
      setAvatar(res.data.avatar);
    })
    .catch(err => alert("Failed to fetch navbar data"));
  }, []);

  return (
    <header className="bg-gray-950 text-black shadow-md w-screen fixed top-0 left-0">
      {authorized ? (
        <>
          <nav className="max-w-full px-16 py-3 flex justify-between items-center gap-64">
            <Link to="/posts" className="text-xl font-semibold text-white">
                MyBlog
            </Link>
            <div className="flex gap-6 items-center">
              <CreatePostModal />
              <Menu>
                {({open}) => (
                  <>
                    <MenuButton className={`inline-flex justify-between w-40 items-center gap-2 bg-[#ffdea3] px-1 py-1 shadow hover:bg-[#fffbef] transition focus:outline-none cursor-pointer ${open ? "rounded-t-md rounded-b-none" : "rounded-md"}`}>
                      <div className="flex gap-2">
                        <img src={avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-xl">{nickname}</span>
                      </div>
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    </MenuButton>
                    <MenuItems anchor="bottom" className={`focus:outline-none bg-[#ffdea3] w-40 rounded-sm ${open ? "rounded-b-md rounded-t-none" : "rounded-md"}`}>
                      <MenuItem>
                        <Link to="/profile">
                          <button className={`flex items-center gap-2 w-full px-4 py-2 hover:bg-yellow-100 cursor-pointer text-lg`}>
                            Профиль
                          </button>
                        </Link> 
                      </MenuItem>
                      <MenuItem>
                        <Link to="/my-posts">
                          <button className={`flex items-center gap-2 w-full px-4 py-2 hover:bg-yellow-100 cursor-pointer text-lg`}>
                            Мои посты
                          </button>
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link to="/sign-out">
                          <button className={`flex items-center gap-2 w-full px-4 py-2 hover:bg-red-300 cursor-pointer text-lg`}>
                            Выйти
                          </button>
                        </Link>
                      </MenuItem>
                    </MenuItems>
                  </>)
                }
              </Menu>
            </div>
          </nav>
        </>
      ) : (
        <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-64">
          <Link to="/login" className="text-xl font-semibold text-white">
            MyBlog
          </Link>
          <div className="flex gap-8 items-center">
            <Link to="/login" className="hover:text-gray-300 text-white">
                Вход
            </Link>
            <Link
              to="/register"
              className="bg-[#ffdea3] text-[#634b20] hover:bg-[#fffbef] px-3 py-1 rounded-md"
            >
              Регистрация
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
