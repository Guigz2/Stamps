"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Configuration de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or anon key.");
}
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UploadPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Veuillez sélectionner un fichier PDF.");
      return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `uploads/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("pdf-uploads") // Assurez-vous d'avoir un bucket nommé "pdfs" dans Supabase
      .upload(filePath, file);

    if (error) {
      console.error("Erreur d'upload:", error.message);
      alert("Échec de l'upload");
      setUploading(false);
      return;
    }

    // Récupérer l'URL publique du fichier
    const { data: { publicUrl } } = supabase.storage.from("pdf-uploads").getPublicUrl(filePath);

    // Sauvegarder dans la base de données
    const { error: dbError } = await supabase.from("pdf_files").insert([
      { name: file.name, url: publicUrl },
    ]);

    if (dbError) {
      console.error("Erreur lors de l'insertion dans la base de données:", dbError.message);
      alert("Erreur lors de l'enregistrement du fichier");
    } else {
      alert("Fichier uploadé avec succès!");
    }

    setUploading(false);
  };

  return (
    <div className="p-6">
      <Link href="/Pages_Budget" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition mb-4 inline-block">
      ⬅️ Retour à l&rsquo;accueil
      </Link>
      <h1 className="text-2xl font-bold flex-1 text-center">Sauvegarder un PDF</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} className="mt-4" />
      <button
        onClick={uploadFile}
        disabled={uploading}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {uploading ? "Upload en cours..." : "Uploader"}
      </button>
    </div>
  );
}