import { Route, Routes, useNavigate } from 'react-router-dom';
import PostList from './pages/PostList';
import PostView from './pages/PostView';
import AuthForm from './pages/AuthForm';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import LogOut from './pages/LogOut';
import Verify from './pages/Verify';
import GuestLayout from './components/Layouts/GuestLayout';
import AuthLayout from './components/Layouts/AuthLayout';

function App() {

  return (
      <Routes>
        <Route element={<GuestLayout />} >
          <Route path='/login' element={<AuthForm mode='login' />}></Route>
          <Route path='/register' element={<AuthForm mode='register'/>} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password/:token' element={<ResetPassword />} />
        </Route>

        <Route element={<AuthLayout />} >
          <Route path='/posts' element={<PostList mine={false} />} />
          <Route path='/my-posts' element={<PostList mine={true} />} />
          <Route path='/posts/:slug' element={<PostView />} />
          <Route path='/user/:nickname' element={<Profile />} />
          <Route path='*' element={<NotFound />} />
          <Route path='/logout' element={<LogOut />}/>
          <Route path='/verify/:token' element={<Verify />} />
        </Route>
      </Routes>
  );
}

export default App;
