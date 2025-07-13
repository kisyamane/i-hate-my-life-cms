import { Link } from "react-router-dom";
import styles from "./NavBar.module.css";
import CreatePost from "./CreatePostModal";
import { useState } from "react";

export default function Navbar() {
    const [visible, setVisible] = useState(false);

  return (
    <div>
        <CreatePost visible={visible} setVisible={setVisible}/>
        <nav className={styles.navbar}>
        <Link to="/posts" className={styles.navbarLogo}>
            MyBlog
        </Link>

        <div className={styles.navbarLinks}>
            <Link to="/posts" className={styles.navLink}>
            Посты
            </Link>
            <button className={styles.createButton} onClick={() => setVisible(true)}>
            Создать пост
            </button>
        </div>
        </nav>
    </div>
  );
}
