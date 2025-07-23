import { Link } from "react-router-dom";
import CreatePostModal from "./CreatePostModal";

export default function Navbar({ authorized }: { authorized: boolean }) {

  return (
    <header className="bg-gray-950 text-black shadow-md w-screen fixed top-0 left-0">
      {authorized ? (
        <>
          <nav className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-64">
            <Link to="/posts" className="text-xl font-semibold text-white">
                MyBlog
            </Link>
            <div className="flex gap-8 items-center">
              <Link to="/my-posts" className="hover:text-gray-300 text-white">
                  Мои посты
              </Link>
              <CreatePostModal />
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
