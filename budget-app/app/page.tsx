import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Gestion de Budget</h1>
      <nav className="space-y-4 text-lg">
        <Link href="/transactions" className="block text-blue-500">📜 Voir les transactions</Link>
        <Link href="/goals" className="block text-green-500">🎯 Objectifs d&rsquo;épargne</Link>
        <Link href="/settings" className="block text-gray-500">⚙️ Paramètres</Link>
      </nav>
    </div>
  );
}
