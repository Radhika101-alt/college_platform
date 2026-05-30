import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
                CollegeScope
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              A modern MVP for college discovery.
            </p>
          </div>

          <nav className="flex flex-wrap gap-4 text-sm text-gray-700">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <Link href="/saved" className="hover:text-gray-900">
              Saved
            </Link>
            <Link href="/compare" className="hover:text-gray-900">
              Compare
            </Link>
            <Link href="/login" className="hover:text-gray-900">
              Login
            </Link>
          </nav>
        </div>

        <div className="mt-8 text-xs text-gray-500">
          © {new Date().getFullYear()} CollegeScope. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
