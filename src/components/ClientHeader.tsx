// "use client";

// import Link from "next/link";
// import React, { useState, useEffect } from "react";
// import dynamic from "next/dynamic";
// import { useSession } from "next-auth/react";
// import { Bell, MessageCircleMore } from "lucide-react";
// import { useNotification } from "@/components/providers/NotificationProvider";
// import { useChatStore } from "@/store/useChatStore";

// const ClientMenu = dynamic(() => import("@/components/ClientMenu"), {
//   ssr: false,
// });

// export default function ClientHeader() {
//   const { data: session, status } = useSession();
//   const isLoggedIn = status === "authenticated";
//   const userRole = session?.user?.role as any;
//   const userImage = session?.user?.image;
//   const userName = session?.user?.name as string;

//   const [scrolled, setScrolled] = useState(false);
//   const { unreadCount } = useNotification();
//   const totalUnreadCount = useChatStore((state) => state.totalUnreadCount);

//   // Handle scroll to change header appearance
//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   return (
//     <header
//       className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
//         scrolled
//           ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm border-b border-border/50 text-slate-900 dark:text-white"
//           : "bg-transparent text-white border-b border-transparent"
//       }`}
//     >
//       <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
//         {/* Logo */}
//         <Link
//           href="/"
//           className={`text-2xl font-black tracking-tighter transition-colors ${
//             scrolled ? "text-primary" : "text-white"
//           }`}
//         >
//           Eventomir <span className="opacity-70 font-medium">Партнер</span>
//         </Link>

//         {/* Right Actions */}
//         <div className="flex items-center gap-2">
//           {/* Always Visible Quick Actions (Logged In) */}
//           {isLoggedIn && (
//             <div className="flex items-center gap-1 md:gap-2">
//               <Link
//                 href="/notifications"
//                 className={`relative flex items-center justify-center h-10 w-10 rounded-full transition-all hover:scale-105 active:scale-95 ${
//                   scrolled
//                     ? "bg-primary/10 hover:bg-primary/20 text-primary"
//                     : "bg-white/10 hover:bg-white/20 text-white"
//                 }`}
//               >
//                 <Bell className="h-5 w-5" />
//                 {unreadCount > 0 && (
//                   <span className="absolute 1 top-0 right-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background">
//                     {unreadCount > 9 ? "9+" : unreadCount}
//                   </span>
//                 )}
//               </Link>

//               <Link
//                 href="/chat"
//                 className={`relative flex items-center justify-center h-10 w-10 rounded-full transition-all hover:scale-105 active:scale-95 ${
//                   scrolled
//                     ? "bg-primary/10 hover:bg-primary/20 text-primary"
//                     : "bg-white/10 hover:bg-white/20 text-white"
//                 }`}
//               >
//                 <MessageCircleMore className="h-5 w-5" />
//                 {totalUnreadCount > 0 && (
//                   <span className="absolute top-0 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background">
//                     {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
//                   </span>
//                 )}
//               </Link>
//             </div>
//           )}

//           {/* Desktop & Mobile Menu Logic */}
//           <ClientMenu
//             isLoggedIn={isLoggedIn}
//             userRole={userRole}
//             userImage={userImage}
//             userName={userName}
//             scrolled={scrolled}
//           />
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation"; // 🚨 ADDED: Need this to check the current route
import { Bell, MessageCircleMore } from "lucide-react";
import { useNotification } from "@/components/providers/NotificationProvider";
import { useChatStore } from "@/store/useChatStore";

const ClientMenu = dynamic(() => import("@/components/ClientMenu"), {
  ssr: false,
});

export default function ClientHeader() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const userRole = session?.user?.role as any;
  const userImage = session?.user?.image;
  const userName = session?.user?.name as string;

  const pathname = usePathname(); // 🚨 ADDED
  const [scrolled, setScrolled] = useState(false);
  const { unreadCount } = useNotification();
  const totalUnreadCount = useChatStore((state) => state.totalUnreadCount);

  // Handle scroll to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🚨 FIXED LOGIC: Only use the transparent theme if we are on the homepage AND haven't scrolled.
  const isHomePage = pathname === "/";
  const useTransparentStyle = isHomePage && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        useTransparentStyle
          ? "bg-transparent text-white border-b border-transparent"
          : "bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-sm border-b border-border/50 text-slate-900 dark:text-white"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className={`text-2xl font-black tracking-tighter transition-colors ${
            useTransparentStyle ? "text-white" : "text-primary"
          }`}
        >
          Eventomir <span className="opacity-70 font-medium">Партнер</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Always Visible Quick Actions (Logged In) */}
          {isLoggedIn && (
            <div className="flex items-center gap-1 md:gap-2">
              <Link
                href="/notifications"
                className={`relative flex items-center justify-center h-10 w-10 rounded-full transition-all hover:scale-105 active:scale-95 ${
                  useTransparentStyle
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-primary/10 hover:bg-primary/20 text-primary"
                }`}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              <Link
                href="/chat"
                className={`relative flex items-center justify-center h-10 w-10 rounded-full transition-all hover:scale-105 active:scale-95 ${
                  useTransparentStyle
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-primary/10 hover:bg-primary/20 text-primary"
                }`}
              >
                <MessageCircleMore className="h-5 w-5" />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-0 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background">
                    {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* Desktop & Mobile Menu Logic */}
          <ClientMenu
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            userImage={userImage}
            userName={userName}
            useTransparentStyle={useTransparentStyle} // 🚨 FIXED PROP
          />
        </div>
      </div>
    </header>
  );
}
