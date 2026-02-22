"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSubmitPartnership } from "@/services/partner";

const formSchema = z.object({
  name: z.string().min(2, { message: "Имя обязательно для заполнения." }),
  email: z.string().email({ message: "Введите корректный email." }),
  website: z
    .string()
    .url({ message: "Введите корректную ссылку на ваш ресурс." }),
  agreement: z.boolean().refine((val) => val === true, {
    message: "Необходимо принять условия партнерской программы.",
  }),
});

export default function PartnershipForm() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // React Query Mutation
  const mutation = useSubmitPartnership();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", website: "", agreement: false },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Exclude the 'agreement' boolean from the payload sent to backend
    const { agreement, ...payload } = values;

    mutation.mutate(payload, {
      onSuccess: (res) => {
        toast({ title: "Заявка отправлена!", description: res.message });
        setIsSubmitted(true);
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: err.message,
        });
      },
    });
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center animate-in fade-in">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
        <p className="font-semibold text-xl">Спасибо за вашу заявку!</p>
        <p className="text-muted-foreground">
          На вашу почту отправлено письмо с подтверждением. Мы рассмотрим заявку
          и свяжемся с вами в ближайшее время.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ваше имя или название компании</FormLabel>
              <FormControl>
                <Input
                  placeholder="Иван Петров"
                  {...field}
                  disabled={mutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Контактный Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="partner@example.com"
                  {...field}
                  disabled={mutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ваш ресурс</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://my-blog.com"
                  {...field}
                  disabled={mutation.isPending}
                />
              </FormControl>
              <FormDescription>
                Ссылка на ваш сайт, блог или соцсеть.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="agreement"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={mutation.isPending}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Я согласен с{" "}
                  <Link
                    href="/documents/terms-of-service"
                    className="underline hover:text-primary"
                  >
                    условиями
                  </Link>{" "}
                  партнерской программы.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full h-12 text-md"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Отправка...
            </>
          ) : (
            "Отправить заявку"
          )}
        </Button>
      </form>
    </Form>
  );
}
