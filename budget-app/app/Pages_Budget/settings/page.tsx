import Link from "next/link";

export default function Settings() {
    return (
      <div className="p-6">
        <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700">
          ⬅️ Retour à l&rsquo;accueil
          </Link>
            <h1 className="text-2xl font-bold text-gray-700">Gestion de Budget</h1>
            <nav className="flex space-x-6 text-lg">
            <Link href="/Pages_Budget/transactions" className="bg-blue-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-blue-700">Dépenses</Link>
            <Link href="/Pages_Budget/credit" className="bg-blue-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-blue-700">Crédits</Link>
            <Link href="/Pages_Budget/mensuel" className="bg-blue-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-blue-700">Mensuel</Link>
            <Link href="/Pages_Budget/pdf_save" className="bg-red-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-red-700">Sauvegarder PDF</Link>
            <Link href="/Pages_Budget/pdf_view" className="bg-red-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-red-700">Voir PDF</Link>
            <Link href="/Pages_Budget/goals" className="bg-green-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-green-700">Finances</Link>
            <Link href="/Pages_Budget/settings" className="bg-gray-700 text-white px-4 py-2 rounded-md text-white-500 hover:bg-gray-700 border-2 border-black">Paramètres</Link>
            </nav>
          </div>
        </header>

        <h1 className="pt-16 text-2xl font-bold flex-1 text-center">⚙️ Paramètres ⚙️</h1>
      </div>
    );
  }
  