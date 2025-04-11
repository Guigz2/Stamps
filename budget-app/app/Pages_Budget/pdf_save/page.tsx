"use client";

import "./styles.css";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Menu, X } from "lucide-react";

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

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-6">
      <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            {/* Bouton de retour */}
            <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700">
            ⬅️ Retour à l&rsquo;accueil
            </Link>
            
            {/* Titre  */}
            <div className="gradient-background">
              <h1 className="font-press-start text-2xl font-bold text-white">
                Budget App
              </h1>
            </div>
            
            {/* Bouton Menu Mobile */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={32} /> : <Menu size={32} />}
            </button>

            {/* Navigation Desktop */}
            <nav className={`hidden lg:flex space-x-6 text-lg ${isOpen ? 'hidden' : 'flex'}`}>
              <Link href="/Pages_Budget/transactions" className="bg-blue-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-blue-700">Dépenses</Link>
              <Link href="/Pages_Budget/credit" className="bg-blue-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-blue-700">Crédits</Link>
              <Link href="/Pages_Budget/mensuel" className="bg-blue-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-blue-700">Mensuel</Link>
              <Link href="/Pages_Budget/pdf_save" className="bg-red-700 text-white px-4 py-2 rounded-md text-white-500 hover:bg-red-700 border-2 border-black">Save PDF</Link>
              <Link href="/Pages_Budget/pdf_view" className="bg-red-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-red-700">Voir PDF</Link>
              <Link href="/Pages_Budget/goals" className="bg-green-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-green-700">Finances</Link>
              <Link href="/Pages_Budget/settings" className="bg-gray-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-gray-700">Paramètres</Link>
            </nav>
          </div>

          {/* Menu Mobile */}
          {isOpen && (
            <div className="lg:hidden absolute top-20 left-0 w-full bg-white shadow-md py-4 flex flex-col items-center space-y-4">
              <NavButton href="/Pages_Budget/transactions" label="Dépenses" color="blue" onClick={() => setIsOpen(false)} />
              <NavButton href="/Pages_Budget/credit" label="Crédits" color="blue" onClick={() => setIsOpen(false)} />
              <NavButton href="/Pages_Budget/mensuel" label="Mensuel" color="blue" onClick={() => setIsOpen(false)} />
              <NavButton href="/Pages_Budget/pdf_save" label="Save PDF" color="red" onClick={() => setIsOpen(false)} />
              <NavButton href="/Pages_Budget/pdf_view" label="Voir PDF" color="red" onClick={() => setIsOpen(false)} />
              <NavButton href="/Pages_Budget/goals" label="Finances" color="green" onClick={() => setIsOpen(false)} />
              <NavButton href="/Pages_Budget/settings" label="Paramètres" color="gray" border onClick={() => setIsOpen(false)} />
            </div>
          )}
        </header>

      <h1 className="lg:pt-16 pt-20 text-2xl font-bold flex-1 text-center">Sauvegarder un PDF</h1>
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

interface NavButtonProps {
  href: string;
  label: string;
  color: "blue" | "red" | "green" | "gray"; // Ajoute d'autres couleurs si besoin
  border?: boolean;
  onClick?: () => void;
}
  
// Composant pour les boutons de navigation
function NavButton({ href, label, color, border = false, onClick }: NavButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-white bg-${color}-500 hover:bg-${color}-700 ${
        border ? "border-2 border-black" : ""
      }`}
    >
      {label}
    </Link>
  );
}