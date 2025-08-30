import * as yup from "yup"
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import Navbar from "../components/NavBar";
import { Input } from "@headlessui/react";
import { Button } from "@headlessui/react";


const schema = yup.object({
    password: yup.string()
    .required("Обязательное поле")
    .min(8, "Минимум 8 символов")
    .max(100, "Максимум 100 символов")
    .matches(/^\S*$/, "Без пробелов")
    .matches(/(?=.*[a-zа-я])/, "Хотя бы одна строчная буква")
    .matches(/(?=.*[A-ZА-Я])/, "Хотя бы одна заглавная буква")
    .matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, "Хотя бы один спец символ")
    .matches(/(?=.*\d)/, "Хотя бы одна цифра"),
  
    confirmPassword: yup.string().
    required("Подтвердите пароль")
    .oneOf([yup.ref("password")], "Пароли не совпадают"),
  
});


export default function resetPassword() {
    const navigate = useNavigate();
    const {token} = useParams();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { password: "", confirmPassword: ""}
    });

    const onSubmit = async(data: {password: string}) => {
        await axios.post('http://localhost:3001/api/auth/reset-password', {token, newPassword: data.password});
        navigate('/login')
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen gap-12">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col gap-6 items-center">                    
                    <p className="text-4xl mb-6 self-center">Смена пароля</p>

                    <div className="relative">
                        <Input type="password" placeholder="Пароль" {...register("password") } 
                            className="w-96 h-12 border-[#634b20] border-1 rounded-md pl-3 focus:data-focus:outline-none"
                        />
                        {errors.password && <small className="text-sm text-red-500 left-0 top-13 mt-1 absolute">{errors.password.message}</small>}
                    </div>

                    <div className="relative">
                        <Input type="password" placeholder="Повторите пароль" {...register("confirmPassword")} 
                            className="w-96 h-12 border-[#634b20] border-1 rounded-md pl-3 focus:data-focus:outline-none"
                        />
                        {errors.confirmPassword && <small className="text-sm text-red-500 left-0 top-13 absolute">{errors.confirmPassword.message}</small>}
                    </div>
                    <Button type="submit" className="w-full h-12 text-white hover:bg-gray-900 bg-gray-950 rounded-md" >
                        Далее
                    </Button>
                </form> 
        </div>
    )
}