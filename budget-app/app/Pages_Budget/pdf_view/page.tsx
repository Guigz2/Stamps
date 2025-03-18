"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or anonymous key");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ViewPDF() {
  const [pdfs, setPdfs] = useState<{ id: string; name: string; url: string }[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string>("");

  useEffect(() => {
    const fetchPdfs = async () => {
      const { data, error } = await supabase.from("pdf_files").select("id, name, url");
      if (error) {
        console.error("Erreur lors de la récupération des PDFs:", error.message);
      } else {
        setPdfs(data);
      }
    };

    fetchPdfs();
  }, []);

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
            <Link href="/Pages_Budget/pdf_view" className="bg-red-700 text-white px-4 py-2 rounded-md text-white-500 hover:bg-red-700 border-2 border-black">Voir PDF</Link>
            <Link href="/Pages_Budget/goals" className="bg-green-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-green-700">Finances</Link>
            <Link href="/Pages_Budget/settings" className="bg-gray-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-gray-700">Paramètres</Link>
          </nav>
        </div>
      </header>

      <h1 className="pt-16 text-2xl font-bold flex-1 text-center">Liste des PDFs</h1>
      <ul className="mt-4 w-1/2">
        {pdfs.map((pdf) => (
          <li key={pdf.id} className="flex justify-between p-2 border-b">
            <span>{pdf.name}</span>
            <button
              onClick={() => setSelectedPdf(pdf.url)}
              className="text-blue-500 hover:underline"
            >
              Voir
            </button>
          </li>
        ))}
      </ul>

      {selectedPdf && (
        <div className="mt-6 w-full max-w-4xl h-[500px] border">
          <iframe
            src={selectedPdf}
            width="100%"
            height="100%"
            className="border rounded"
          ></iframe>
        </div>
      )}
    </div>
  );
}
