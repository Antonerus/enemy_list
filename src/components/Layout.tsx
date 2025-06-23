import Link from "next/link";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="bg-pink-200 p-4 flex justify-between">
          <div className="font-bold">Enemies List 😈</div>
          <div className="space-x-4">
            <Link href="/">Home</Link>
            <Link href="/enemies">Enemies</Link>
            <Link href="/login">Login</Link>
          </div>
        </nav>
        <main className="flex-grow p-6">
          {children}
        </main>
      </div>
    )
}