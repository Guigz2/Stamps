"use client";

import Link from 'next/link';


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <Link href="/" >
              <img src="/homepage-icon.png" className="h-14 w-14" />
      </Link>
      
      <h1 className="text-3xl font-bold mb-6">Gestion de Tâches</h1>
      <nav className="space-y-4 text-lg text-center">
        <Link href="/" className="block text-blue-500">Faire une requête</Link>
      </nav>
    </div>
  );
}