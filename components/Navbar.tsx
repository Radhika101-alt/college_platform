"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

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
  { label: "Saved", href: "/saved" },
];

export default function Navbar() {
  // We use local state for the mobile menu.
  // This is why the navbar is a Client Component.
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { data: session, status } = useSession();
  const isAuthed = Boolean(session?.user?.email);
  const isLoadingSession = status === "loading";

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="text-base font-semibold tracking-tight"
          onClick={() => setIsMenuOpen(false)}
        >
          College Discovery
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

          {!isLoadingSession ? (
            isAuthed ? (
              <button
                type="button"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
            )
          ) : null}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {/* Simple hamburger / close icon without extra dependencies */}
          <span className="sr-only">Open main menu</span>
          {isMenuOpen ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
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
                  <button
                    type="button"
                    className="rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => {
                      setIsMenuOpen(false);
                      void signOut({ callbackUrl: "/" });
                    }}
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                )
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
