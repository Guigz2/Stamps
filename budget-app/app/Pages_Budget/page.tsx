"use client";
import "./styles.css";
import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link href="/" >
              <img src="/homepage-icon.png" className="h-14 w-14" />
      </Link>
      {/* Titre  */}
      <div className="gradient-background">
        <h1 className="font-press-start text-2xl font-bold text-white">
          Budget App
        </h1>
      </div>
            
        <nav className="flex space-x-6 text-lg">
          <Link href="/Pages_Budget/transactions" className="text-blue-500 hover:underline">Dépenses</Link>
          <Link href="/Pages_Budget/credit" className="text-blue-500 hover:underline">Crédits</Link>
          <Link href="/Pages_Budget/mensuel" className="text-blue-500 hover:underline">Mensuel</Link>
          <Link href="/Pages_Budget/pdf_save" className="text-red-500 hover:underline">Sauvegarder PDF</Link>
          <Link href="/Pages_Budget/pdf_view" className="text-red-500 hover:underline">Voir PDF</Link>
          <Link href="/Pages_Budget/goals" className="text-green-500 hover:underline">Finances</Link>
          <Link href="/Pages_Budget/settings" className="text-gray-500 hover:underline">Paramètres</Link>
        </nav>
      </div>
    </header>
  );
}
