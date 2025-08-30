import { useEffect, useRef, useState } from "react";
import Navbar from "../components/NavBar";
import * as yup from "yup"
import { useParams } from "react-router-dom";
import API from "../services/api";



const schema = yup.object({
    email: yup.string()
      .email("Неверный email")
      .required("Обязательное поле"),
});



export default function Verify() {

    const token = useParams<{ token: string }>();
    const verified = useRef<Boolean>(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        API.post(`/api/verify?token=${token}`)
        .then((res) => {
            setLoading(false);
            verified.current = true;
        })
        .catch(err => {
            setLoading(false);
            verified.current = false;
        })
    }, [])

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen gap-12">
            <p className="text-6xl self-center">{loading ? "..." : verified ? "Аккаунт подтврежден" : "Токен недействителен или устарел"}</p>
        </div>
    )
}