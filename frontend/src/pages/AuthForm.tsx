import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Input } from "@headlessui/react";
import { Button } from "@headlessui/react";
import Navbar from "../components/NavBar";
import { Link } from "react-router-dom";





const schema = yup.object({
    email: yup.string()
      .email("Неверный email")
      .required("Обязательное поле"),
  
    password: yup.string().required("Обязательное поле").when("mode", {
      is: "register",
      then: (schema) =>
        schema
          .min(8, "Минимум 8 символов")
          .max(100, "Максимум 100 символов")
          .matches(/^\S*$/, "Без пробелов")
          .matches(/(?=.*[a-zа-я])/, "Хотя бы одна строчная буква")
          .matches(/(?=.*[A-ZА-Я])/, "Хотя бы одна заглавная буква")
          .matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, "Хотя бы один спец символ")
          .matches(/(?=.*\d)/, "Хотя бы одна цифра")
          .required("Обязательное поле"),
    }),
  
    confirmPassword: yup.string().when("mode", {
      is: "register",
      then: (schema) =>
        schema
          .required("Подтвердите пароль")
          .oneOf([yup.ref("password")], "Пароли не совпадают"),
    }),
  
    mode: yup.string().required(),
});

export default function AuthForm({mode}: { mode: string }) {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { email: "", password: "", confirmPassword: "", mode }
    });

    const onSubmit = async(data: {email: string, password: string}) => {
        if (mode === 'login') {
            try {
                const res = await API.post('/api/auth/login', data);
                localStorage.setItem('jwt_sign', res.data.jwt_sign);
                localStorage.setItem('nickname', res.data.nickname);
                localStorage.setItem('id', res.data.id);
                navigate('/posts');
            } catch(err) {
                alert('Login failed');
            }
        } else if (mode === 'register') {
            try {
                console.log(data);
                const res = await API.post('/api/auth/register', { email: data.email, password: data.password });
                localStorage.setItem('token', res.data.token);
                navigate('/login');
            } catch(err) {
                alert('Register failed');
            }
        }
    }

    return (
        <>
            <Navbar authorized={false} />
            <div className="flex flex-row items-center justify-around min-h-screen gap-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col gap-6">
                    <input type="hidden" value={mode} {...register("mode")} />
                    
                    <p className="text-4xl mb-6 self-center">{mode === 'register' ? 'Регистация' : 'Вход'}</p>

                    <div className="relative">
                        <Input type="email" placeholder="Email" {...register("email")}
                            className="w-96 h-12 border-[#634b20] border-1 rounded-md pl-3 focus:data-focus:outline-none"
                        />
                        {errors.email && <small className="text-sm text-red-500 left-0 top-13 absolute">{errors.email.message}</small>}
                    </div>

                    <div className="relative">
                        <Input type="password" placeholder="Пароль" {...register("password") } 
                            className="w-96 h-12 border-[#634b20] border-1 rounded-md pl-3 focus:data-focus:outline-none"
                        />
                        {errors.password && <small className="text-sm text-red-500 left-0 top-13 absolute">{errors.password.message}</small>}
                    </div>

                    {mode === 'register' ? (
                        <div className="relative">
                            <Input type="password" placeholder="Повторите пароль" {...register("confirmPassword")} 
                                className="w-96 h-12 border-[#634b20] border-1 rounded-md pl-3 focus:data-focus:outline-none"
                            />
                            {errors.confirmPassword && <small className="text-sm text-red-500 absolute left-0 top-13">{errors.confirmPassword.message}</small>}
                        </div>
                    ) : (
                        <Link to="/forgot-password" className="text-sm font-semibold self-end mt-[-22px] text-[#634b20] hover:text-amber-500 underline">
                            Забыли пароль?
                        </Link>
                    )}

                    <Button type="submit" className="cursor-pointer w-full h-12 text-white hover:bg-gray-900 bg-gray-950 rounded-md" >
                        {mode === 'login' ? "Войти" : "Зарегистрироваться"}
                    </Button>
                </form>
                <img src="login.png" alt="chating" 
                    className="max-w-4xl h-screen mt-8"
                />
            </div>
        </>
    )
}