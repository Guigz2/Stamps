"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// Définition du type Transaction
interface Transaction {
  id?: string;
  description: string;
  amount: string;
  category: string;
  date: string;
}

// Liste des catégories disponibles
const categories = ["Loisir", "Logement", "Santé", "Transport", "Alimentation", "Sport", "Voyage", "Autres"];

// Attribution des couleurs aux catégories
const categoryColors: { [key: string]: string } = {
  "Loisir": "bg-blue-200",
  "Logement": "bg-green-200",
  "Santé": "bg-red-200",
  "Transport": "bg-yellow-200",
  "Alimentation": "bg-purple-200",
  "Sport": "bg-orange-200",
  "Voyage": "bg-teal-200",
  "Autres": "bg-gray-200"
};

export default function Transactions() {
  /*
      Définition des constantes

      "
      const [transactions, setTransactions] = useState<Transaction[]>([]);
      "
      Création du tableau d'objet Transaction qui liste toutes les transactions stockées
      Les valeurs de bases de transactions sont mis à jour grâce à setTransactions qui est contenu dans useEffect


      "
      const [formData, setFormData] = useState<Transaction>({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      "
      Stocke les valeurs du formulaire de saisie dans un objet Transaction
      SetFormData est la fonction pour mettre à jour les valeurs du formulaire.


      "
      const [editingId, setEditingId] = useState<string | null>(null);
      "
      Stock l'ID de la transaction en cours d'édition
      SetEditingID est la fonction pour changer l’ID de la transaction en cours d’édition.
  */
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState<Transaction>({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState<string | null>(null);


  /*
      Charger les transactions depuis Supabase
  */
  // useEffect permet d'éxecuter une action au chargement du composant
  useEffect(() => {
    const fetchTransactions = async () => {
      // la définition d'une sorte de requête SQL
      const { data } = await supabase
        .from("transactions")
        .select("id, desc, amount, category, date")
        .order("date", { ascending: false });

      //Changement des champs pour aligner ce qu'envoie Supabase avec l'objet Transaction
      //Chargement des transactions dans le tableau transactions
      if (data) {
        setTransactions(data.map((t) => ({
          id: t.id,
          description: t.desc,
          amount: t.amount,
          category: t.category,
          date: t.date,
        })));
      }
    };

    //On exécute fetchTransactions
    fetchTransactions();
  }, []);

  /*
      Ajouter ou modifier une transaction
  */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingId) {
      // Mise à jour d'une transaction existante
      await supabase
        .from("transactions")
        .update({ 
          desc: formData.description, 
          amount: parseFloat(formData.amount), 
          category: formData.category, 
          date: formData.date 
        })
        .eq("id", editingId);

      setTransactions(
        transactions
          .map((t) => (t.id === editingId ? { ...formData, id: editingId } : t))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );

      setEditingId(null);
    } else {
      // Ajout d'une nouvelle transaction
      const { data } = await supabase
        .from("transactions")
        .insert([{ 
          desc: formData.description,  
          amount: parseFloat(formData.amount), 
          category: formData.category, 
          date: formData.date 
        }])
        .select("*");

      if (data) {
        setTransactions((prevTransactions) => 
          [...prevTransactions, { ...data[0], description: data[0].desc }]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
      }
    }

    setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0] });
  };


  /*
      Supprimer ou modifier une transaction
  */
  const handleDelete = async (id?: string) => {
    if (!id) return;

    await supabase.from("transactions").delete().eq("id", Number(id));

    setTransactions(transactions.filter((transaction) => transaction.id !== id));
  };


  /*
      Pré-remplir le formulaire pour modification
  */
  const handleEdit = (transaction: Transaction) => {
    setFormData(transaction);
    setEditingId(transaction.id || null);
  };


  /*
      Calculer la somme des montants du mois
  */
  const getTotalForCurrentMonth = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    return transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getFullYear() === currentYear && transactionDate.getMonth() + 1 === currentMonth;
      })
      .reduce((total, transaction) => total + parseFloat(transaction.amount), 0)
      .toFixed(2);
  };


  /*
      Le visuel de la page
  */
  return (
    <div className="p-6">
        <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition inline-block">
          ⬅️ Retour à l&rsquo;accueil
        </Link>
        <h1 className="text-2xl font-bold flex-1 text-center">📜 Mes Transactions 📜</h1>

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
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2 w-full">{editingId ? "Modifier" : "Ajouter"}</button>
      </form>
      
      <div className="mt-4 p-4 bg-green-100 rounded-lg text-green-800 font-bold text-lg">
        💰 Total des dépenses du mois : {getTotalForCurrentMonth()} €
      </div>

      <table className="mt-4 w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th>Description</th>
            <th>Montant (€)</th>
            <th>Catégorie</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className={`${categoryColors[transaction.category] || "bg-white"}`}>
              <td>{transaction.description}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.category}</td>
              <td>{new Date(transaction.date).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleEdit(transaction)} className="text-blue-500 hover:text-blue-700">✏️</button>
                <button onClick={() => handleDelete(transaction.id)} className="text-red-500 hover:text-red-700 ml-2">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
