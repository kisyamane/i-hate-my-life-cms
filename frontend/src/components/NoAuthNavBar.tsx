import { Link } from "react-router-dom";
import styles from "./NavBar.module.css";

export default function Navbar() {

  return (
    <div>
        <nav className={styles.navbar}>
        <Link to="/login" className={styles.navbarLogo}>
            MyBlog
        </Link>

        <div className={styles.navbarLinks}>
            <Link to="/login" className={styles.navLink}>
            Вход
            </Link>
            <Link to="/register" className={styles.navLink}>
            Регистрация
            </Link>
        </div>
        </nav>
    </div>
  );
}
