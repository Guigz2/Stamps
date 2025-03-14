"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

// Définition du type de transaction
interface Transaction {
  id?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const categoryColorsExpense: { [key: string]: string } = {
  "Loisir": "#9B59B6",
  "Logement": "#2ECC71",
  "Santé/bien-être": "#E74C3C",
  "Transport": "#F1C40F",
  "Alimentation": "#3498DB",
  "Frais bancaires exceptionnels": "#E67E22",
  "Abonnement": "#1ABC9C",
  "Retrait": "#95A5A6",
  "Autres": "#BDC3C7",
};

const categoryColorsCredits: { [key: string]: string } = {
  "Salaire": "#2ECC71",
  "Prime": "#3498DB",
  "Remboursement": "#F1C40F",
  "Revenu passif": "#9B59B6",
  "Autres": "#BDC3C7",
};

export default function Goals() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [credits, setCredits] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<{ category: string; total: number }[]>([]);
  const [creditChartData, setCreditChartData] = useState<{ category: string; total: number }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data: transactionsData } = await supabase.from("transactions").select("id, amount, category, desc, date");
      if (transactionsData) {
        setTransactions(transactionsData.map((t) => ({
          id: t.id,
          description: t.desc || "",
          amount: t.amount,
          category: t.category,
          date: t.date,
        })));
      }
      const { data: creditsData } = await supabase.from("credits").select("id, amount, category, desc, date");
      if (creditsData) {
        setCredits(creditsData.map((t) => ({
          id: t.id,
          description: t.desc || "",
          amount: t.amount,
          category: t.category,
          date: t.date,
        })));
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    processChartData(transactions, setChartData);
    processChartData(credits, setCreditChartData);
  }, [transactions, credits, selectedMonth, selectedYear]);

  const processChartData = (data: Transaction[], setChartData: Function) => {
    const filteredData = data.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });
    const categoryTotals: { [key: string]: number } = {};
    filteredData.forEach((t) => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    setChartData(Object.keys(categoryTotals).map((category) => ({ category, total: categoryTotals[category] })));
  };

  return (
    <div className="p-6">
      <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
        ⬅️ Retour à l’accueil
      </Link>
      <h1 className="text-2xl font-bold text-center flex-1">🎯 Visualisation des finances 🎯</h1>

      {/* Filtres */}
      <div className="flex space-x-4 justify-center my-4">
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="p-2 border rounded">
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{`Mois ${i + 1}`}</option>
          ))}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="p-2 border rounded">
          {[...Array(5)].map((_, i) => (
            <option key={i} value={selectedYear - i}>{selectedYear - i}</option>
          ))}
        </select>
      </div>

      {[{ title: "Dépenses", data: chartData }, { title: "Crédits", data: creditChartData }].map(({ title, data }, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-md my-6">
          <h2 className="text-xl font-semibold mb-4">{title} par Catégorie</h2>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
            <div className="w-full md:w-1/2">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={(title === "Dépenses" ? categoryColorsExpense : categoryColorsCredits)[entry.category] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}€`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-xl font-semibold mb-4">Détails des {title}</h2>
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-200 text-center border border-black">
                    <th className="border px-4 py-2">Catégorie</th>
                    <th className="border px-4 py-2">Montant (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((entry) => (
                    <tr 
                    key={entry.category} 
                    className="border-b text-black text-center" 
                    style={{ backgroundColor: `${(title === "Dépenses" ? categoryColorsExpense : categoryColorsCredits)[entry.category] || "#ccc"}` }}
                        >
                      <td className="border px-4 py-2">{entry.category}</td>
                      <td className="border px-4 py-2">{entry.total}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
