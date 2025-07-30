import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-6xl font-extrabold text-red-600 mb-4">404</h1>
      <p className="text-2xl font-semibold mb-8">Упс! Такой страницы не существует.</p>

    </div>
  );
}
