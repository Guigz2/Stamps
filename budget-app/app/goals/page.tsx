import Link from "next/link";

export default function Goals() {
    return (
      <div className="p-6">
        <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition mb-4 inline-block">
        ⬅️ Retour à l'accueil
        </Link>
        <h1 className="text-2xl font-bold">🎯 Objectifs Financiers</h1>
        <p className="text-gray-600 mt-2">Suivez et atteignez vos objectifs d&rsquo;épargne ici.</p>
      </div>
    );
  }
  