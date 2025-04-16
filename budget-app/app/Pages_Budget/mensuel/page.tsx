"use client";

import "./styles.css";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Menu, X } from "lucide-react";

// Définition du type MonthlyPayment
interface MonthlyPayment {
  id?: string;
  description: string;
  amount: string;
  category: string;
  type: string;
}

// Liste des catégories de paiements
const paymentCategoriesExpense = [
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

const paymentCategoriesCredit = [
    "Salaire",
    "Prime",
    "Remboursement",
    "Revenu passif",
    "Autres"
  ];

const paymentType = [
  "Dépense",
  "Crédit"
];

const paymentColors: { [key: string]: string } = {
  "Crédit": "bg-green-200",
  "Dépense": "bg-red-200",
};

export default function MonthlyPayments() {
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [formData, setFormData] = useState<MonthlyPayment>({
    description: "",
    amount: "",
    category: "",
    type: "", // Valeur par défaut
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  /*
      Charger les paiements depuis Supabase
  */
  useEffect(() => {
    const fetchPayments = async () => {
      const { data } = await supabase
        .from("monthly_payment") // Nouvelle table
        .select("id, desc, amount, category, type");

      if (data) {
        setPayments(data.map((p) => ({
          id: p.id,
          description: p.desc,
          amount: p.amount,
          category: p.category,
          type: p.type,
        })));
      }
    };

    fetchPayments();
  }, []);

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    if (formData.type === "Dépense") {
      setAvailableCategories(paymentCategoriesExpense);
    } else if (formData.type === "Crédit") {
      setAvailableCategories(paymentCategoriesCredit);
    } else {
      setAvailableCategories([]);
    }
  }, [formData.type]);

  /*
      Ajouter ou modifier un paiement
  */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (editingId) {
      await supabase
        .from("monthly_payment")
        .update({ 
          desc: formData.description, 
          amount: parseFloat(formData.amount), 
          category: formData.category, 
          type: formData.type,
        })
        .eq("id", editingId);

      setPayments(
        payments.map((p) => (p.id === editingId ? { ...formData, id: editingId } : p))
      );

      setEditingId(null);
    } else {
      const { data } = await supabase
        .from("monthly_payment")
        .insert([{ 
          desc: formData.description,  
          amount: parseFloat(formData.amount), 
          category: formData.category, 
          type: formData.type,
        }])
        .select("*");

      if (data) {
        setPayments((prevPayments) => 
          [...prevPayments, { ...data[0], description: data[0].desc }]
        );
      }
    }

    setFormData({ description: "", amount: "", category: "", type: "" });
  };

  /*
      Supprimer un paiement
  */
  const handleDelete = async (id?: string) => {
    if (!id) return;

    await supabase.from("monthly_payment").delete().eq("id", Number(id));

    setPayments(payments.filter((payment) => payment.id !== id));
  };
  
  const handleEdit = (payment: MonthlyPayment) => {
    setFormData(payment);
    setEditingId(payment.id || null);
  };

  /*
      Calculer le total par type
  */
  const getTotalByType = () => {
    return payments.reduce(
      (totals, payment) => {
        if (payment.type === "Dépense") {
          totals.expenses += parseFloat(payment.amount);
        } else if (payment.type === "Crédit") {
          totals.credits += parseFloat(payment.amount);
        }
        return totals;
      },
      { expenses: 0, credits: 0 }
    );
  };
  
  const totals = getTotalByType();

  /*
      Le visuel de la page
  */
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-6">
      <header className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            {/* Bouton de retour */}
            <a href="/" >
              <img src={"/homepage-icon.png"} className="h-14 w-14" />
            </a>
            
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
              <Link href="/Pages_Budget/mensuel" className="bg-blue-700 text-white px-4 py-2 rounded-md text-white-500 hover:bg-blue-700 border-2 border-black">Mensuel</Link>
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
              <NavButton href="/Pages_Budget/pdf_save" label="Save PDF" color="red" onClick={() => setIsOpen(false)} />
              <NavButton href="/Pages_Budget/pdf_view" label="Voir PDF" color="red" onClick={() => setIsOpen(false)} />
              <NavButton href="/Pages_Budget/goals" label="Finances" color="green" onClick={() => setIsOpen(false)} />
              <NavButton href="/Pages_Budget/settings" label="Paramètres" color="gray" border onClick={() => setIsOpen(false)} />
            </div>
          )}
        </header>

      <h1 className="lg:pt-16 pt-20 text-2xl font-bold flex-1 text-center">💳 Mes Crédits/Dépenses Mensuels 💳</h1>

      <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-100 rounded-lg">
        <input type="text" name="description" placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="w-full p-2 border rounded" />
        <input type="number" name="amount" placeholder="Montant" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required className="w-full p-2 border rounded mt-2" />
        <select name="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} required className="w-full p-2 border rounded mt-2">
          <option value="" disabled>Choisir un type</option>
          {paymentType.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          name="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
          className="w-full p-2 border rounded mt-2"
        >
          <option value="" disabled>Choisir une catégorie</option>
          {availableCategories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2 w-full">{editingId ? "Modifier" : "Ajouter"}</button>
      </form>

      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <p className="text-lg font-bold">💰 Totaux :</p>
        <p className="text-red-600 font-semibold">Dépenses : {totals.expenses.toFixed(2)} €</p>
        <p className="text-green-600 font-semibold">Crédits : {totals.credits.toFixed(2)} €</p>
      </div>

      <table className="mt-4 w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200 border border-black">
            <th className="text-center p-2 border border-black">Description</th>
            <th className="text-center p-2 border border-black">Montant (€)</th>
            <th className="text-center p-2 border border-black">Catégorie</th>
            <th className="text-center p-2 border border-black">Type</th>
            <th className="text-center p-2 border border-black">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className={`${paymentColors[payment.type] || "bg-white"} border border-black`}>
              <td className="text-center p-2 border border-black">{payment.description}</td>
              <td className="text-center p-2 border border-black">{payment.amount}</td>
              <td className="text-center p-2 border border-black">{payment.category}</td>
              <td className="text-center p-2 border border-black">{payment.type}</td>
              <td className="text-center p-2 border border-black">
                <button onClick={() => handleEdit(payment)} className="text-blue-500 hover:text-blue-700">✏️</button>
                <button onClick={() => handleDelete(payment.id)} className="text-red-500 hover:text-red-700 ml-2">🗑️</button>
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