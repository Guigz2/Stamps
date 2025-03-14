"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Définition du type de transaction
interface Transaction {
  id?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

const categoryColors: { [key: string]: string } = {
  "Loisir": "#9B59B6", // Violet
  "Logement": "#2ECC71", // Vert
  "Santé/bien-être": "#E74C3C", // Rouge
  "Transport": "#F1C40F", // Jaune
  "Alimentation": "#3498DB", // Bleu
  "Frais bancaires exceptionnels": "#E67E22", // Orange
  "Abonnement": "#1ABC9C", // Turquoise
  "Retrait": "#95A5A6", // Gris foncé
  "Autres": "#BDC3C7", // Gris clair
};


export default function Goals() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<{ category: string; total: number }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Charger les transactions depuis Supabase
  useEffect(() => {
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("id, amount, category, desc, date");

        if (data) {
          const formattedData = data.map((t) => ({
            id: t.id,
            description: t.desc || "", // Ajout de description vide si absent
            amount: t.amount,
            category: t.category,
            date: t.date,
          }));
        
          setTransactions(formattedData);
          processChartData(formattedData, selectedMonth, selectedYear);

        }
        
    };

    fetchTransactions();
  }, []);

  // Filtrer et transformer les transactions en données pour le graphique
  const processChartData = (transactions: Transaction[], month: number, year: number) => {
    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() + 1 === month && transactionDate.getFullYear() === year;
    });

    const categoryTotals: { [key: string]: number } = {};
    filteredTransactions.forEach((transaction) => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += transaction.amount;
    });

    // Convertir l'objet en tableau pour Recharts
    const formattedData = Object.keys(categoryTotals).map((category) => ({
      category,
      total: categoryTotals[category],
    }));

    setChartData(formattedData);
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number
  }) => {
  
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };
  
  // Mettre à jour les données du graphique quand les filtres changent
  useEffect(() => {
    processChartData(transactions, selectedMonth, selectedYear);
  }, [transactions, selectedMonth, selectedYear]);

  return (
    <div className="p-6">
      <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition">
          ⬅️ Retour à l&rsquo;accueil
      </Link>
      <h1 className="text-2xl font-bold text-center flex-1">🎯 Visualisation des finances 🎯</h1>
      

      {/* Sélecteurs de filtre Mois / Année */}
      <div className="flex space-x-4 mb-6">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="p-2 border rounded-md"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
            <option key={month} value={month}>
              {new Date(2024, month - 1).toLocaleString("fr-FR", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="p-2 border rounded-md"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Graphique */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Dépenses par Catégorie</h2>
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
      {/* Graphique en camembert */}
      <div className="w-full md:w-1/2">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderCustomizedLabel}  // Utilisation du label personnalisé
              labelLine={false} // Supprime les lignes des labels
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || "#ccc"} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value}€`, name]} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau des catégories et montants */}
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-semibold mb-4">Détails des Dépenses</h2>
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2 text-left">Catégorie</th>
              <th className="border px-4 py-2 text-right">Montant (€)</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((entry) => (
              <tr 
                key={entry.category} 
                className="border-b text-black" 
                style={{ backgroundColor: `${categoryColors[entry.category]}80` }} // Couleur avec opacité
              >
                <td className="border px-4 py-2">{entry.category}</td>
                <td className="border px-4 py-2 text-right">{entry.total}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>




      </div>
    </div>
  );
}
