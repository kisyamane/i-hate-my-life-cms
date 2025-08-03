import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import * as yup from "yup";
import { Input, Button, Textarea } from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import clsx from 'clsx'

const schema = yup.object({
    title: yup.string().required("Обязательное поле"),
    content: yup.string().required("Обязательное поле")
});

export default function CreatePostModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const {
      register,
      handleSubmit,
      reset,
      formState: { errors }
  } = useForm({
      resolver: yupResolver(schema),
      defaultValues: { title: "", content: ""}
  });

  const onSubmit = async(data: {title: string, content: string}) => {
    try {
      const post = await API.post('/api/new-post', data);
      console.log(post);
      navigate(`/:${post.data.slug}`);
      setOpen(false); // Закрываем модальное окно после успешного создания
      reset(); // Сбрасываем форму
    } catch(err) {
      alert("Failed to create post")
    }
  }

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        className="bg-[#ffdea3] hover:bg-[#fffbef] text-md px-2 py-0.5 rounded-md text-gray-950 transition cursor-pointer font-medium"
      >
        Создать пост
      </Button>
      
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        className="relative z-50"
      >
        <DialogBackdrop 
          transition
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel 
            className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-2xl border-2 border-[#634b20]"
          >
            <DialogTitle 
              as="h3" 
              className="text-2xl font-semibold text-[#634b20] mb-6 text-center"
            >
              Новый пост
            </DialogTitle>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#634b20]">
                  Название
                </label>
                <div className="relative">
                  <Input 
                    {...register("title")}
                    className={clsx(
                      'w-full h-12 border-[#634b20] border-1 rounded-md pl-3',
                      'focus:outline-none'
                    )}
                  />
                  {errors.title && (
                    <small className="text-sm text-red-500 absolute left-0 top-13">
                      {errors.title.message}
                    </small>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#634b20]">
                  Описание
                </label>
                <div className="relative">
                  <Textarea 
                    {...register("content")} 
                    className={clsx(
                      'w-full border-[#634b20] border-1 rounded-md pl-3 pt-3',
                      'focus:outline-none'
                    )}
                    rows={4}
                  />
                  {errors.content && (
                    <small className="text-sm text-red-500 absolute left-0 top-full mt-1">
                      {errors.content.message}
                    </small>
                  )}
                </div>
              </div>
              
              <div className="flex justify-center gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={clsx(
                    'px-4 py-2 rounded-lg border-1 border-gray-700',
                    'bg-red-400 hover:bg-red-300 text-gray-950',
                    'transition-colors duration-200 cursor-pointer'
                  )}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className={clsx(
                    'px-4 py-2 rounded-md text-white',
                    'bg-gray-950 hover:bg-gray-700',
                    'transition-colors duration-200 cursor-pointer'
                  )}
                >
                  Опубликовать
                </Button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}