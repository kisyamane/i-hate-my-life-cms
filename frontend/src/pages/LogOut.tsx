import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function LogOut() {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('jwt_sign');
        navigate('/login');
    })

    return <></>
}