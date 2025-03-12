"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// Définition du type Transaction
interface Transaction {
  id?: string;
  description: string;
  amount: string;
  category: string;
  date: string;
}

// Liste des catégories disponibles
const categories = ["Loisir", "Logement", "Santé", "Transport", "Soin", "Sport", "Voyage", "Autres"];

// Attribution des couleurs aux catégories
const categoryColors: { [key: string]: string } = {
  "Loisir": "bg-blue-200",
  "Logement": "bg-green-200",
  "Santé": "bg-red-200",
  "Transport": "bg-yellow-200",
  "Soin": "bg-purple-200",
  "Sport": "bg-orange-200",
  "Voyage": "bg-teal-200",
  "Autres": "bg-gray-200"
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState<Transaction>({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Charger les transactions depuis Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("id, desc, amount, category, date") // Correction : `desc` au lieu de `description`
          .order("date", { ascending: false });

        if (error) {
          console.error("🔴 Erreur de récupération Supabase :", error.message, error);
        } else {
          console.log("✅ Transactions récupérées :", data);
          setTransactions(data.map((t) => ({
            id: t.id,
            description: t.desc, // Correction ici
            amount: t.amount,
            category: t.category,
            date: t.date,
          })));
        }
      } catch (err) {
        console.error("⚠️ Une erreur inattendue s'est produite :", err);
      }
    };

    fetchTransactions();
  }, []);

  // Ajouter une transaction à Supabase
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([{ 
          desc: formData.description,  // Correction ici
          amount: parseFloat(formData.amount), 
          category: formData.category, 
          date: formData.date 
        }])
        .select("*");

      if (error) {
        console.error("🔴 Erreur d'ajout Supabase :", error.message, error);
      } else {
        console.log("✅ Transaction ajoutée :", data);
        setTransactions([
          { ...data[0], description: data[0].desc }, // Ajoute `description` à partir de `desc`
          ...transactions
        ]);
        setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
      }
    } catch (err) {
      console.error("⚠️ Une erreur inattendue s'est produite :", err);
    }
  };

  // Supprimer une transaction de Supabase
  // Supprimer une transaction de Supabase
const handleDelete = async (id?: string) => {
  if (!id) return;

  try {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", Number(id)); // Convertit l'ID en nombre

    if (error) {
      console.error("🔴 Erreur de suppression Supabase :", error.message, error);
    } else {
      console.log(`✅ Transaction avec l'ID ${id} supprimée de Supabase`);
      setTransactions(transactions.filter((transaction) => transaction.id !== id));
    }
  } catch (err) {
    console.error("⚠️ Une erreur inattendue s'est produite :", err);
  }
};


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📜 Mes Transactions</h1>
      <p className="text-gray-600 mt-2">Ici, vous pourrez voir toutes vos transactions.</p>

      <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-100 rounded-lg">
        <input type="text" name="description" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="w-full p-2 border rounded" />
        <input type="number" name="amount" placeholder="Montant" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required className="w-full p-2 border rounded mt-2" />
        <select name="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full p-2 border rounded mt-2">
          <option value="" disabled>Choisir une catégorie</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input type="date" name="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required className="w-full p-2 border rounded mt-2" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2 w-full">Ajouter</button>
      </form>

      <table className="mt-4 w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Description</th>
            <th className="border border-gray-300 p-2">Montant (€)</th>
            <th className="border border-gray-300 p-2">Catégorie</th>
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className={`border border-gray-300 ${categoryColors[transaction.category] || "bg-white"}`}>
              <td className="border border-gray-300 p-2">{transaction.description}</td>
              <td className="border border-gray-300 p-2">{transaction.amount}</td>
              <td className="border border-gray-300 p-2">{transaction.category}</td>
              <td className="border border-gray-300 p-2">{new Date(transaction.date).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2 text-center">
                <button onClick={() => handleDelete(transaction.id)} className="text-red-500 hover:text-red-700">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
