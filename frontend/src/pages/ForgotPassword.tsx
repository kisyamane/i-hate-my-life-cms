import axios from "axios";
import { useState } from "react";
import { Input } from "@headlessui/react";
import { Button } from "@headlessui/react";
import Navbar from "../components/NavBar";
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup"



const schema = yup.object({
    email: yup.string()
      .email("Неверный email")
      .required("Обязательное поле"),
});



export default function ForgotPassword() {
    
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { email: ""}
    });

    const [sent, setSent] = useState(false);

    const onSubmit = async(data: {email:string}) => {
        await axios.post('http://localhost:3001/api/auth/forgot-password', data);
        setSent(true);
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen gap-12">
            { !sent && <p className="text-5xl mb-6">Сброс пароля</p> }
            {sent ? (
                <p className="text-6xl self-center">Письмо с ссылкой отправлено</p>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col gap-6">
                    <div className="relative">
                        <Input 
                            type='email' 
                            placeholder="Email" 
                            {...register("email")}
                            className="w-2xl h-12 border-[#634b20] border-1 rounded-md pl-3 focus:data-focus:outline-none"
                        />
                        { errors.email && <small className="text-sm text-red-500 absolute left-0 top-13">{errors.email.message}</small>}
                    </div>
                    <Button type="submit" className="w-full h-12 text-white hover:bg-gray-900 bg-gray-950 rounded-md">
                        Далее
                    </Button>
                </form>
            )}
        </div>
    )
}