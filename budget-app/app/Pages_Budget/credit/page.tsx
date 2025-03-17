"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// Définition du type Crédit
interface Credit {
  id?: string;
  description: string;
  amount: string;
  category: string;
  date: string;
}

// Liste des catégories de crédits
const creditCategories = [
  "Salaire",
  "Prime",
  "Remboursement",
  "Revenu passif",
  "Autres"
];

// Attribution des couleurs aux catégories
const categoryColors: { [key: string]: string } = {
  "Salaire": "bg-green-200",
  "Prime": "bg-blue-200",
  "Remboursement": "bg-yellow-200",
  "Revenu passif": "bg-purple-200",
  "Autres": "bg-gray-200",
};

export default function Credits() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [formData, setFormData] = useState<Credit>({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  /*
      Charger les crédits depuis Supabase
  */
  useEffect(() => {
    const fetchCredits = async () => {
      const { data } = await supabase
        .from("credits") // Assurez-vous que la table "credits" existe
        .select("id, desc, amount, category, date")
        .order("date", { ascending: false });

      if (data) {
        setCredits(data.map((c) => ({
          id: c.id,
          description: c.desc,
          amount: c.amount,
          category: c.category,
          date: c.date,
        })));
      }
    };

    fetchCredits();
  }, []);

  /*
      Ajouter ou modifier un crédit
  */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from("credits")
        .update({ 
          desc: formData.description, 
          amount: parseFloat(formData.amount), 
          category: formData.category, 
          date: formData.date 
        })
        .eq("id", editingId);

      setCredits(
        credits
          .map((c) => (c.id === editingId ? { ...formData, id: editingId } : c))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );

      setEditingId(null);
    } else {
      const { data } = await supabase
        .from("credits")
        .insert([{ 
          desc: formData.description,  
          amount: parseFloat(formData.amount), 
          category: formData.category, 
          date: formData.date 
        }])
        .select("*");

      if (data) {
        setCredits((prevCredits) => 
          [...prevCredits, { ...data[0], description: data[0].desc }]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      }
    }

    setFormData({ description: "", amount: "", category: "", date: new Date().toISOString().split("T")[0] });
  };

  /*
      Supprimer un crédit
  */
  const handleDelete = async (id?: string) => {
    if (!id) return;

    await supabase.from("credits").delete().eq("id", Number(id));

    setCredits(credits.filter((credit) => credit.id !== id));
  };

  /*
      Pré-remplir le formulaire pour modification
  */
  const handleEdit = (credit: Credit) => {
    setFormData(credit);
    setEditingId(credit.id || null);
  };

  /*
      Calculer la somme des crédits du mois
  */
  const getTotalForCurrentMonth = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    return credits
      .filter((credit) => {
        const creditDate = new Date(credit.date);
        return creditDate.getFullYear() === currentYear && creditDate.getMonth() + 1 === currentMonth;
      })
      .reduce((total, credit) => total + parseFloat(credit.amount), 0)
      .toFixed(2);
  };

  /*
      Le visuel de la page
  */
  return (
    <div className="p-6">
      <Link href="/Pages_Budget" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition mb-4 inline-block">
      ⬅️ Retour à l&rsquo;accueil
      </Link>
      <h1 className="text-2xl font-bold flex-1 text-center">💰 Mes Crédits 💰</h1>

      <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-100 rounded-lg">
        <input type="text" name="description" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="w-full p-2 border rounded" />
        <input type="number" name="amount" placeholder="Montant" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required className="w-full p-2 border rounded mt-2" />
        <select name="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full p-2 border rounded mt-2">
          <option value="" disabled>Choisir une catégorie</option>
          {creditCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input type="date" name="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required className="w-full p-2 border rounded mt-2" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2 w-full">{editingId ? "Modifier" : "Ajouter"}</button>
      </form>
      
      <div className="mt-4 p-4 bg-green-100 rounded-lg text-green-800 font-bold text-lg">
        💰 Total des crédits du mois : {getTotalForCurrentMonth()} €
      </div>

      <table className="mt-4 w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 border border-black">
            <th className="text-center p-2 border border-black">Description</th>
            <th className="text-center p-2 border border-black">Montant (€)</th>
            <th className="text-center p-2 border border-black">Catégorie</th>
            <th className="text-center p-2 border border-black">Date</th>
            <th className="text-center p-2 border border-black">Actions</th>
          </tr>
        </thead>
        <tbody>
          {credits.map((credit) => (
            <tr key={credit.id} className={`${categoryColors[credit.category] || "bg-white"} border border-black`}>
              <td className="text-center p-2 border border-black">{credit.description}</td>
              <td className="text-center p-2 border border-black">{credit.amount}</td>
              <td className="text-center p-2 border border-black">{credit.category}</td>
              <td className="text-center p-2 border border-black">{new Date(credit.date).toLocaleDateString()}</td>
              <td className="text-center p-2 border border-black">
                <button onClick={() => handleEdit(credit)} className="text-blue-500 hover:text-blue-700">✏️</button>
                <button onClick={() => handleDelete(credit.id)} className="text-red-500 hover:text-red-700 ml-2">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
