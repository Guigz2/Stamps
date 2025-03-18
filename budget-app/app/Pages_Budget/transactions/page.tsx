"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Menu, X } from "lucide-react";

// Définition du type Transaction
interface Transaction {
  id?: string;
  description: string;
  amount: string;
  category: string;
  date: string;
}

// Liste des catégories disponibles
const categories = [
  "Loisir",
  "Logement",
  "Santé/bien-être",
  "Transport",
  "Alimentation",
  "Frais bancaires exceptionnels",
  "Abonnement",
  "Retrait",
  "Autres"
];

// Attribution des couleurs aux catégories
const categoryColors: { [key: string]: string } = {
  "Loisir": "bg-purple-200",
  "Logement": "bg-green-200",
  "Santé/bien-être": "bg-red-200",
  "Transport": "bg-yellow-200",
  "Alimentation": "bg-blue-200",
  "Frais bancaires exceptionnels": "bg-orange-200",
  "Abonnement": "bg-teal-200",
  "Retrait": "bg-gray-400",
  "Autres": "bg-gray-200",
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
          <h1 className="text-2xl font-bold text-gray-700">Gestion de Budget</h1>
          
          {/* Bouton Menu Mobile */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-gray-700 focus:outline-none"
          >
            {isOpen ? <X size={32} /> : <Menu size={32} />}
          </button>

          {/* Navigation Desktop */}
          <nav className={`hidden lg:flex space-x-6 text-lg ${isOpen ? 'hidden' : 'flex'}`}>
            <Link href="/Pages_Budget/transactions" className="bg-blue-700 text-white px-4 py-2 rounded-md text-white-500 hover:bg-blue-700 border-2 border-black">Dépenses</Link>
            <Link href="/Pages_Budget/credit" className="bg-blue-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-blue-700">Crédits</Link>
            <Link href="/Pages_Budget/mensuel" className="bg-blue-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-blue-700">Mensuel</Link>
            <Link href="/Pages_Budget/pdf_save" className="bg-red-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-red-700">Save PDF</Link>
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
            <NavButton href="/Pages_Budget/pdf_save" label="Sauvegarder PDF" color="red" onClick={() => setIsOpen(false)} />
            <NavButton href="/Pages_Budget/pdf_view" label="Voir PDF" color="red" onClick={() => setIsOpen(false)} />
            <NavButton href="/Pages_Budget/goals" label="Finances" color="green" onClick={() => setIsOpen(false)} />
            <NavButton href="/Pages_Budget/settings" label="Paramètres" color="gray" border onClick={() => setIsOpen(false)} />
          </div>
        )}
      </header>
      
      <h1 className="lg:pt-16 pt-20 text-2xl font-bold flex-1 text-center">📜 Mes dépenses 📜</h1>

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
      
      <div className="mt-4 p-4 bg-red-100 rounded-lg text-red-800 font-bold text-lg">
        💰 Total des dépenses du mois : {getTotalForCurrentMonth()} €
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
          {transactions.map((transaction) => (
            <tr key={transaction.id} className={`${categoryColors[transaction.category] || "bg-white"} border border-black`}>
              <td className="text-center p-2 border border-black">{transaction.description}</td>
              <td className="text-center p-2 border border-black">{transaction.amount}</td>
              <td className="text-center p-2 border border-black">{transaction.category}</td>
              <td className="text-center p-2 border border-black">{new Date(transaction.date).toLocaleDateString()}</td>
              <td className="text-center p-2 border border-black">
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