"use client";

import Link from 'next/link';


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition mb-4 inline-block">
      ⬅️ Retour à l&rsquo;accueil
      </Link>
      <h1 className="text-3xl font-bold mb-6">Gestion de Tâches</h1>
      <nav className="space-y-4 text-lg text-center">
        <Link href="/" className="block text-blue-500">Faire une requête</Link>
      </nav>
    </div>
  );
}