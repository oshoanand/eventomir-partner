"use client";

import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";
import { signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  LogIn,
  ArrowRight,
  Bell,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";

interface ClientMenuProps {
  isLoggedIn: boolean;
  unreadCount: number;
  userRole: "partner" | "performer" | null;
  userImage?: string | null;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const ClientMenu: React.FC<ClientMenuProps> = ({
  isLoggedIn,
  userRole,
  userImage,
  onOpenChange,
  unreadCount,
}) => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Logic: Determine Profile Link based on Role ---
  const getProfileLink = () => {
    switch (userRole) {
      case "partner":
        return "/dashboard";
      default:
        return "/";
    }
  };

  const profileHref = getProfileLink();

  // --- Logic: Handle Logout ---
  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  const menuLinks = [{ href: "/about", label: "О нас", alwaysVisible: true }];

  const closeMenu = () => setIsMenuOpen(false);

  if (!isClient) return null;

  const filteredLinks = menuLinks.filter((link) => link.alwaysVisible);

  const ProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-9 w-9 transition-opacity hover:opacity-80 border border-border">
            <AvatarImage
              src={userImage || ""}
              alt="Profile"
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Мой аккаунт</p>
            <p className="text-xs leading-none text-muted-foreground capitalize">
              {userRole === "partner" ? "Партнер" : userRole}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            href={profileHref}
            onClick={closeMenu}
            className="cursor-pointer"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Личный кабинет</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600 focus:text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Выйти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // --- MOBILE VIEW ---
  if (isMobile) {
    return (
      <Sheet
        open={isMenuOpen}
        onOpenChange={(open) => {
          setIsMenuOpen(open);
          if (onOpenChange) onOpenChange(open);
        }}
      >
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-3/4 bg-secondary flex flex-col">
          <SheetHeader>
            <SheetTitle>Меню</SheetTitle>
            <SheetDescription>Навигация по сайту.</SheetDescription>
          </SheetHeader>

          <nav className="grid gap-4 py-4 flex-1">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-2 py-1 text-lg rounded hover:bg-accent hover:text-accent-foreground"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Buttons at the bottom of mobile menu */}
          <div className="border-t pt-4 px-2 pb-4">
            {!isLoggedIn ? (
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  asChild
                  className="w-full justify-start"
                  onClick={closeMenu}
                >
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" /> Войти
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-start"
                  onClick={closeMenu}
                >
                  <Link href="/#register-form">Стать партнером</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {userRole === "partner" && (
                  <Button
                    asChild
                    className="w-full justify-start"
                    onClick={closeMenu}
                  >
                    <Link href="/dashboard">
                      Личный кабинет <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {isLoggedIn && (
                  <Link href="/notifications">
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-4 w-4 min-w-[16px] p-0 flex items-center justify-center rounded-full text-[10px]"
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                      )}
                      <span className="sr-only">Уведомления</span>
                    </Button>
                  </Link>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Профиль
                  </span>
                  <ProfileDropdown />
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // --- DESKTOP VIEW ---
  return (
    <nav className="flex items-center gap-6">
      {filteredLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          {link.label}
        </Link>
      ))}

      <div className="ml-2 flex items-center gap-4">
        {!isLoggedIn ? (
          <>
            <Button variant="outline" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Войти
              </Link>
            </Button>
            <Button asChild>
              <Link href="/#register-form">Стать партнером</Link>
            </Button>
          </>
        ) : (
          <>
            {userRole === "partner" && (
              <Button asChild>
                <Link href="/dashboard">
                  Личный кабинет <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            {isLoggedIn && (
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 min-w-[16px] p-0 flex items-center justify-center rounded-full text-[10px]"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Уведомления</span>
                </Button>
              </Link>
            )}
            <ProfileDropdown />
          </>
        )}
      </div>
    </nav>
  );
};

export default ClientMenu;
