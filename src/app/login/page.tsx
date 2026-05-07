"use client";

import { signIn, useSession, signOut } from "next-auth/react";
import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  LogOut,
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  Sparkles,
  TrendingUp,
} from "lucide-react";

// Importing your custom icons
import { YandexIcon, VkontakteIcon, GoogleIcon } from "@/components/Icons";

const formSchema = z.object({
  email: z.string().email({
    message: "Пожалуйста, введите корректный адрес электронной почты.",
  }),
  password: z
    .string()
    .min(8, {
      message:
        "Пароль должен состоять как минимум из 8 символов и одной заглавной латинской буквы.",
    })
    .regex(/[A-Z]/, {
      message: "Должно содержать как минимум одну заглавную букву",
    }),
});

const LoginPage = () => {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  // --- CREDENTIALS LOGIN HANDLER ---
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const { email, password } = values;

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Ошибка входа",
          description: result.error,
        });
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Произошла ошибка. Пожалуйста, попробуйте еще раз.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- OAUTH LOGIN HANDLER ---
  const handleOAuthLogin = async (provider: "google" | "yandex" | "vk") => {
    setLoadingProvider(provider);
    try {
      await signIn(provider, { callbackUrl: "/dashboard" });
    } catch (error) {
      setLoadingProvider(null);
      toast({
        variant: "destructive",
        title: "Ошибка авторизации",
        description: `Не удалось войти через выбранную социальную сеть.`,
      });
    }
  };

  const isAnyLoading = isSubmitting || loadingProvider !== null;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          <div className="h-4 w-32 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  // --- ALREADY LOGGED IN STATE ---
  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

        <Card className="w-full max-w-[400px] text-center shadow-2xl border-slate-800 bg-slate-900/80 backdrop-blur-xl rounded-[2rem] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <CardHeader className="pb-4 pt-10">
            <div className="mx-auto bg-amber-500/10 text-amber-400 h-20 w-20 flex items-center justify-center rounded-full mb-6 ring-8 ring-amber-500/5">
              <AlertCircle className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Вы уже вошли
            </CardTitle>
            <CardDescription className="text-sm mt-2 text-slate-400">
              Вы авторизованы на платформе как{" "}
              <strong className="text-white">Partner</strong> <br />
              <span className="text-slate-500 mt-1 block">
                ({session.user?.email})
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-8 pb-10">
            <div className="p-4 bg-slate-800/50 rounded-xl text-xs text-slate-400 mb-6 leading-relaxed border border-slate-700/50">
              Чтобы войти в другой аккаунт, вам необходимо сначала выйти из
              текущего профиля.
            </div>
            <Button
              variant="destructive"
              onClick={() => signOut({ redirect: false })}
              className="w-full h-12 rounded-xl font-bold shadow-sm"
            >
              <LogOut className="mr-2 h-5 w-5" /> Выйти из аккаунта
            </Button>
            <Button
              variant="outline"
              asChild
              className="w-full h-12 rounded-xl font-bold bg-transparent border-slate-700 text-white hover:bg-slate-800 hover:text-white"
            >
              <Link href="/dashboard">
                Вернуться в панель <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- MAIN LOGIN STATE (Split Screen) ---
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-950 overflow-hidden">
      {/* ======================= LEFT PANE (BRANDING & IMAGE) ======================= */}
      <div className="hidden lg:flex relative w-full h-full flex-col  p-12 overflow-hidden bg-slate-900 border-r border-slate-800/60">
        {/* Background Image & Overlays */}
        {/* Note: Using a high-quality event placeholder image */}
        <Image
          src="/images/loginBG.webp"
          alt="Eventomir Events"
          fill
          className="object-cover opacity-40 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-2">
          <Link
            href="/"
            className="text-2xl font-black tracking-tighter transition-colors text-white"
          >
            Eventomir <span className="opacity-70 font-medium">Партнер</span>
          </Link>
        </div>

        {/* Bottom Content (Value Prop & Floating Metric) */}
        <div className="relative z-10 space-y-8 max-w-xl py-8">
          {/* Floating Metric Card matching B2B theme */}
          <div className="p-5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md shadow-2xl w-64 animate-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2.5 bg-primary/20 rounded-xl">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-300 font-medium">
                  Новые заказы
                </p>
                <p className="text-xl font-bold text-white">+34% за месяц</p>
              </div>
            </div>
            <div className="w-full bg-slate-800/50 rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full w-[75%] shadow-[0_0_10px_rgba(var(--primary),0.8)]"></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium backdrop-blur-md">
              <Sparkles className="w-4 h-4" /> B2B Платформа
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Управляйте своим <br />
              <span className="text-primary">ивент-бизнесом</span> эффективно.
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Получайте заявки, анализируйте статистику и увеличивайте свой
              доход с помощью профессиональных инструментов Eventomir.
            </p>
          </div>
        </div>
      </div>

      {/* ======================= RIGHT PANE (LOGIN FORM) ======================= */}
      <div className="flex w-full h-full items-center justify-center p-4 sm:p-8 relative">
        {/* Ambient Glowing Background (Visible mostly on mobile, acts as backing on desktop) */}
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none lg:bg-primary/5" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none lg:bg-blue-600/5" />
        <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none lg:hidden"></div>

        {/* The Card */}
        <Card className="w-full max-w-[420px] shadow-2xl border-slate-800/60 bg-slate-900/80 lg:bg-slate-900/40 backdrop-blur-2xl rounded-[2rem] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <CardHeader className="space-y-2 pt-10 pb-6 text-center border-b border-slate-800/50">
            {/* Show logo only on mobile since left pane handles desktop logo */}
            <div className="lg:hidden mb-2">
              <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                Eventomir{" "}
                <span className="opacity-70  text-2xl font-black tracking-tighter transition-colors text-white">
                  Партнер
                </span>
              </h1>
            </div>

            <CardTitle className="text-2xl font-bold text-white hidden lg:block">
              Вход в кабинет
            </CardTitle>
            <CardDescription className="text-sm font-medium text-slate-400">
              Войдите для управления заказами и финансами
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-10 pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-xs uppercase tracking-wider text-slate-400 ml-1">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                          <Input
                            placeholder="example@mail.com"
                            {...field}
                            type="email"
                            disabled={isAnyLoading}
                            className="pl-12 h-12 rounded-xl bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:bg-slate-900 focus:border-primary/50 transition-all text-sm"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="ml-1 text-xs text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-xs uppercase tracking-wider text-slate-400 ml-1">
                        Пароль
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                          <Input
                            placeholder="••••••••"
                            {...field}
                            type="password"
                            disabled={isAnyLoading}
                            className="pl-12 h-12 rounded-xl bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:bg-slate-900 focus:border-primary/50 transition-all text-sm"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="ml-1 text-xs text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-1">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-slate-400 hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    Забыли пароль?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isAnyLoading}
                  className="w-full h-12 mt-2 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_30px_rgba(var(--primary),0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {isSubmitting ? "Вход..." : "Войти в аккаунт"}
                </Button>
              </form>
            </Form>

            {/* Separator */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 lg:bg-slate-900/60 px-3 text-slate-500 font-semibold tracking-wider text-[10px]">
                  Или войти через
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="flex flex-col space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin("google")}
                disabled={isAnyLoading}
                className="w-full h-12 rounded-xl bg-slate-800/50 text-white hover:bg-slate-800 hover:text-white border-slate-700 relative overflow-hidden transition-all group"
              >
                {loadingProvider === "google" ? (
                  <Loader2 className="w-5 h-5 animate-spin absolute left-4 text-slate-400" />
                ) : (
                  <GoogleIcon className="w-5 h-5 absolute left-4 group-hover:scale-110 transition-transform" />
                )}
                <span className="font-semibold text-sm">
                  Войти через Google
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin("yandex")}
                disabled={isAnyLoading}
                className="w-full h-12 rounded-xl bg-slate-800/50 text-white hover:bg-slate-800 hover:text-white border-slate-700 relative overflow-hidden transition-all group"
              >
                {loadingProvider === "yandex" ? (
                  <Loader2 className="w-5 h-5 animate-spin absolute left-4 text-slate-400" />
                ) : (
                  <YandexIcon className="w-5 h-5 absolute left-4 group-hover:scale-110 transition-transform" />
                )}
                <span className="font-semibold text-sm">
                  Войти через Яндекс
                </span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthLogin("vk")}
                disabled={isAnyLoading}
                className="w-full h-12 rounded-xl bg-[#0077FF]/10 border-transparent text-[#0077FF] hover:bg-[#0077FF]/20 hover:text-[#0077FF] relative overflow-hidden transition-all group"
              >
                {loadingProvider === "vk" ? (
                  <Loader2 className="w-5 h-5 animate-spin absolute left-4" />
                ) : (
                  <VkontakteIcon className="w-5 h-5 absolute left-4 fill-current group-hover:scale-110 transition-transform" />
                )}
                <span className="font-semibold text-sm">
                  Войти через ВКонтакте
                </span>
              </Button>
            </div>

            <div className="mt-8 text-center text-xs font-medium text-slate-400">
              Нет аккаунта?{" "}
              <Link
                href="/register"
                className="text-white font-bold hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                Зарегистрироваться
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
