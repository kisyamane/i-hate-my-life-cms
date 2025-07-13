import React, { Dispatch, SetStateAction, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import styles from "./CreatePostModal.module.css";

interface CreatePostProps {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
}
export default function CreatePost({ visible, setVisible }: CreatePostProps) {
  interface CreatedPost {
    data: {
      title: string;
      content: string;
      slug: string;
      authorId: number;
    };
  }

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const rootClasses = [styles.modal];

  if (visible) {
    rootClasses.push(styles.activate);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = (await API.post("api/new-post", { title, content })) as CreatedPost;
      navigate(`/posts/${res.data.slug}`); 
      setVisible(false);
    } catch (err) {
      alert("Failed to create a post");
    }
  };

  return (
    <div className={rootClasses.join(' ')} onClick={() => setVisible(false)}>
        <form onSubmit={handleSubmit} className={styles.formContainer} onClick={(e) => e.stopPropagation()}>
          <input
              type="text"
              placeholder="Заголовок"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.inputField}
          />
          <textarea
              placeholder="Содержимое поста..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${styles.inputField} ${styles.textArea}`}
          />
          <button type="submit" className={styles.submitButton}>
              Создать пост
          </button>
        </form>
    </div>
  );
}
