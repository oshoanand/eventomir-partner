"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import ChatListScreen from "@/components/chat/ChatListScreen";
import ChatDetailScreen from "@/components/chat/ChatDetailScreen";
import { clsx } from "clsx";

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // State to manage the currently selected chat in the split-pane
  const [selectedChat, setSelectedChat] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Zustand Store
  const connectSocket = useChatStore((state) => state.connectSocket);
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  const userId = session?.user?.id;

  // 🚨 FIX 1: Connection Effect (Strictly depends ONLY on auth status & userId)
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (userId) {
      connectSocket(userId);
      setIsReady(true);
    }
  }, [status, userId, router, connectSocket]);

  // 🚨 FIX 2: Active Chat Effect (Strictly separated from the socket connection)
  useEffect(() => {
    if (isReady) {
      setActiveChat(selectedChat?.id || null);
    }
  }, [selectedChat, setActiveChat, isReady]);

  if (!isReady || status === "loading") {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-muted-foreground font-medium">Загрузка чатов...</p>
      </div>
    );
  }

  return (
    <div className="container flex h-[100dvh] sm:h-[calc(100vh-5rem)] w-full overflow-hidden bg-background sm:rounded-2xl sm:border sm:border-border/50  sm:mt-6 mx-auto">
      {/* LEFT PANE: Chat List */}
      <div
        className={clsx(
          "w-full md:w-[380px] flex-shrink-0 border-r border-border/50 bg-card flex flex-col",
          selectedChat ? "hidden md:flex" : "flex",
        )}
      >
        {/* Because the Backend injects the Admin, ChatListScreen can just render data natively without hacking it */}
        <ChatListScreen
          selectedChatId={selectedChat?.id}
          onSelectChat={(id, name) => setSelectedChat({ id, name })}
        />
      </div>

      {/* RIGHT PANE: Chat Detail */}
      <div
        className={clsx(
          "flex-1 flex flex-col bg-background/50 relative",
          !selectedChat ? "hidden md:flex" : "flex",
        )}
      >
        {selectedChat ? (
          <ChatDetailScreen
            partnerId={selectedChat.id}
            partnerName={selectedChat.name}
            onBack={() => setSelectedChat(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-60">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">Выберите чат</p>
            <p className="text-sm">чтобы начать общение</p>
          </div>
        )}
      </div>
    </div>
  );
}
