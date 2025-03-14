"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

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
  return (
    <div className="p-6">
      <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition inline-block">
        ⬅️ Retour à l&rsquo;accueil
      </Link>
      <h1 className="text-2xl font-bold flex-1 text-center">💳 Mes Crédits/Dépenses Mensuels 💳</h1>

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
