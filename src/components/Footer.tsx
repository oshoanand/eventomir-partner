"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { VkontakteIcon, TelegramIcon } from "@/components/Icons";
import { useSiteSettings } from "@/components/providers/SiteThemeProvider";
import { Mail, Phone, ExternalLink } from "lucide-react";

const Footer = () => {
  const settings = useSiteSettings();
  const { status } = useSession();
  const currentYear = new Date().getFullYear();
  const isLoading = !settings;

  const contacts = settings?.contacts;
  const siteName = settings?.siteName || "Eventomir";
  const mainAppUrl =
    process.env.NEXT_PUBLIC_WEB_APP_URL || "https://eventomir.ru";

  return (
    <footer className="relative bg-slate-950 border-t border-slate-900 pt-16 pb-8 mt-auto overflow-hidden text-slate-400">
      {/* --- Subtle Background Glows matching the Hero section --- */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

      <div className="container mx-auto px-5 md:px-8 relative z-10">
        {/* Main Footer Content: Flex layout instead of Grid */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
          {/* 1. Brand & Info */}
          <div className="flex flex-col items-center md:items-start space-y-4 max-w-sm">
            <Link
              href="/"
              className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400 transition-colors"
            >
              {siteName}{" "}
              <span className="opacity-70  text-2xl font-black tracking-tighter transition-colors text-white">
                Партнер
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              Платформа для масштабирования вашего ивент-бизнеса. Находите новых
              клиентов и управляйте заказами в одной экосистеме.
            </p>
          </div>

          {/* 2. Single Row of Links */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-sm font-medium text-slate-300">
            <Link
              href={mainAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              Главная платформа{" "}
              <ExternalLink className="h-3.5 w-3.5 opacity-50" />
            </Link>
            <Link
              href={`${mainAppUrl}/pricing`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              Тарифы <ExternalLink className="h-3.5 w-3.5 opacity-50" />
            </Link>
            <Link
              href="/documents"
              className="hover:text-white transition-colors"
            >
              Справка и Документы
            </Link>
          </nav>

          {/* 3. Contacts & Socials */}
          <div className="flex flex-col items-center md:items-end space-y-4">
            {isLoading ? (
              <div className="space-y-3 flex flex-col items-end">
                <Skeleton className="h-5 w-40 bg-slate-800" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-800" />
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-800" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-slate-300">
                  {contacts?.phone && (
                    <a
                      href={`tel:${contacts.phone}`}
                      className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                      <Phone className="h-4 w-4 text-primary group-hover:text-blue-400 transition-colors" />
                      {contacts.phone}
                    </a>
                  )}
                  {contacts?.email && (
                    <a
                      href={`mailto:${contacts.email}`}
                      className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                      <Mail className="h-4 w-4 text-primary group-hover:text-blue-400 transition-colors" />
                      {contacts.email}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {contacts?.vkLink && (
                    <Link
                      href={contacts.vkLink}
                      aria-label="VK"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-primary hover:border-primary text-slate-300 hover:text-white transition-all duration-300"
                    >
                      <VkontakteIcon className="w-5 h-5" />
                    </Link>
                  )}
                  {contacts?.telegramLink && (
                    <Link
                      href={contacts.telegramLink}
                      aria-label="Telegram"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-blue-500 hover:border-blue-500 text-slate-300 hover:text-white transition-all duration-300"
                    >
                      <TelegramIcon className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <Separator className="my-8 bg-slate-800" />

        {/* Bottom Footer: Legal & Copyright */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-medium">
          <p className="flex items-center gap-3">
            &copy; {currentYear} ООО «АМУЛЕТ КОМПАНИ». Все права защищены.
            <span className="px-2 py-0.5 bg-slate-800 rounded text-[9px] font-black uppercase tracking-widest text-slate-400">
              18+
            </span>
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
            <span className="hidden md:inline">
              ИНН: 6319258622 • ОГРН: 1226300038360
            </span>
            <Link
              href={`${mainAppUrl}/documents#privacy`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Конфиденциальность
            </Link>
            <Link
              href={`${mainAppUrl}/documents#terms`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
