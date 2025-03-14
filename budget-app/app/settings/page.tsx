import Link from "next/link";

export default function Settings() {
    return (
      <div className="p-6">
        <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition mb-4 inline-block">
        ⬅️ Retour à l&rsquo;accueil
        </Link>
        <h1 className="text-2xl font-bold">⚙️ Paramètres</h1>
      </div>
    );
  }
  