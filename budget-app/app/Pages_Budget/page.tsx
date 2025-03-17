"use client";

import Link from 'next/link';


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition mb-4 inline-block">
      ⬅️ Retour à l&rsquo;accueil
      </Link>
      <h1 className="text-3xl font-bold mb-6">Gestion de Budget</h1>
      <nav className="space-y-4 text-lg text-center">
        <Link href="/Pages_Budget/transactions" className="block text-blue-500">📜 Ajouter des Dépenses 📜</Link>
        <Link href="/Pages_Budget/credit" className="block text-blue-500">💰 Ajouter des Crédits 💰</Link>
        <Link href="/Pages_Budget/mensuel" className="block text-blue-500">💳 Ajouter des Crédits/Dépenses Mensuels 💳</Link>
        <Link href="/Pages_Budget/pdf_save" className="block text-red-500">Sauvegarder un PDF</Link>
        <Link href="/Pages_Budget/pdf_view" className="block text-red-500">Regarder un PDF</Link>
        <Link href="/Pages_Budget/goals" className="block text-green-500">🎯 Visualisation des finances 🎯</Link>
        <Link href="/Pages_Budget/settings" className="block text-gray-500">⚙️ Paramètres ⚙️</Link>
      </nav>
    </div>
  );
}