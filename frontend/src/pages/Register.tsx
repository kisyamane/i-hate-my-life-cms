import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import styles from "./AuthForm.module.css";
import NoAuthNavBar from '../components/NoAuthNavBar'

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await API.post('/api/auth/register', {email, password});
      localStorage.setItem('token', res.data.token);
      navigate('/posts');
    } catch(err) {
      alert('Register failed');
    }
  }

  return (
    <div>
        <NoAuthNavBar />
        <form onSubmit={handleSubmit} className={styles.formContainer}>
        <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={styles.inputField}
        />
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={styles.inputField}
        />
        <button type="submit" className={styles.submitButton}>Регистрация</button>
    </form>

    </div>
  );
}
