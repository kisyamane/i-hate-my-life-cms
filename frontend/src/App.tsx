import { Route, Routes, useNavigate } from 'react-router-dom';
import PostList from './pages/PostList';
import PostView from './pages/PostView';
import AuthForm from './pages/AuthForm';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {

  return (
    <div className="bg-[#fffbef] text-[#5f471d] min-h-screen font-[Montserrat]">
      <Routes>
        <Route path='/login' element={<AuthForm mode='login' />}></Route>
        <Route path='/register' element={<AuthForm mode='register'/>} />
        <Route path='/posts' element={<PostList mine={false} />} />
        <Route path='/my-posts' element={<PostList mine={true} />} />
        <Route path='/posts/:slug' element={<PostView />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
