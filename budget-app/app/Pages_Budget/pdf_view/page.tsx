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
      <Link href="/Pages_Budget" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition mb-4 inline-block">
      ⬅️ Retour à l&rsquo;accueil
      </Link>
      <h1 className="text-2xl font-bold flex-1 text-center">Liste des PDFs</h1>
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
