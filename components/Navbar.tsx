"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { LogIn, LogOut, Menu, User, X, Bookmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type NavItem = {
  label: string;
  href: string;
};

// Keep nav items in one place so it’s easy to add routes later
// (e.g., Compare, Saved, Auth) without rewriting the component.
const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  // This anchors to the colleges list on the homepage.
  { label: "Colleges", href: "/#colleges" },
  { label: "Compare", href: "/compare" },
  { label: "Predictor", href: "/predictor" },
  { label: "Saved", href: "/saved" },
];

function initialsFromEmail(email: string) {
  const part = email.split("@")[0] ?? "";
  const clean = part.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return (clean.slice(0, 2) || "U").padEnd(2, "U");
}

export default function Navbar() {
  // We use local state for the mobile menu.
  // This is why the navbar is a Client Component.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: session, status } = useSession();
  const isAuthed = Boolean(session?.user?.email);
  const isLoadingSession = status === "loading";
  const email = session?.user?.email ?? "";

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="text-base font-semibold tracking-tight"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="bg-linear-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            CollegeScope
          </span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-6 sm:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop auth area */}
        <div className="hidden items-center gap-2 sm:flex">
          {!isLoadingSession ? (
            isAuthed ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 gap-2 px-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>{initialsFromEmail(email)}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-40 truncate text-sm">{email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/saved" className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      Saved colleges
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline">
                  <Link href="/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )
          ) : null}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {/* Simple hamburger / close icon without extra dependencies */}
          <span className="sr-only">Open main menu</span>
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {isMenuOpen ? (
        <div className="border-t bg-white sm:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-3" aria-label="Mobile">
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {!isLoadingSession ? (
                isAuthed ? (
                  <>
                    <Link
                      href="/profile"
                      className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      className="rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                      onClick={() => {
                        setIsMenuOpen(false);
                        void signOut({ callbackUrl: "/" });
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-1 pt-1">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
