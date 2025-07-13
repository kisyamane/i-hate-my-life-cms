import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PostList from './pages/PostList';
import PostView from './pages/PostView';
import styles from './App.module.css'

function App() {

  return (
    <div className={styles.mainContainer}>
      <Routes>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/register' element={<Register />} />
        <Route path='/posts' element={<PostList />} />
        <Route path='/posts/:slug' element={<PostView />} />
      </Routes>
    </div>
  );
}

export default App;
