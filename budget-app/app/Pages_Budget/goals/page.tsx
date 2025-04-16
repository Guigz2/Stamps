"use client";

import "./styles.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell} from "recharts";
import { Menu, X } from "lucide-react";

/*
https://media.licdn.com/dms/image/v2/D4E22AQHGjMzvJMWzLQ/feedshare-shrink_800/feedshare-shrink_800/0/1719510938980?e=2147483647&v=beta&t=LZaG9rbzGemVUJ_5cUDLWpxSHxUBcULEAkWrJD-rDoU
https://www.slideteam.net/wp/wp-content/uploads/2024/02/8-Tableau-de-bord-financier-pour-les-revenus-et-depenses-de-fin-de-mois.png
*/
// Définition du type de transaction
interface Transaction {
  id?: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface MonthlyPayment {
  id?: string;
  description: string;
  amount: number;
  category: string;
  type: string;
}

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

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
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);

  const [chartData, setChartData] = useState<{ category: string; total: number }[]>([]);
  const [creditChartData, setCreditChartData] = useState<{ category: string; total: number }[]>([]);
  const [paymentChartData, setPaymentChartData] = useState<{ type: string; category: string; total: number }[]>([]);

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
      const { data: paymentsData } = await supabase.from("monthly_payment").select("id, amount, category, desc, type");
      if (paymentsData) {
        setPayments(paymentsData.map((t) => ({
          id: t.id,
          description: t.desc || "",
          amount: t.amount,
          category: t.category,
          type: t.type,
        })));
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    const processChartData = (
      data: Transaction[],
      setChartData: React.Dispatch<React.SetStateAction<{ category: string; total: number }[]>>
    ) => {
    
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
  
    processChartData(transactions, setChartData);
    processChartData(credits, setCreditChartData);
  }, [transactions, credits, selectedMonth, selectedYear]); 

  // ...existing code...

useEffect(() => {
  const processPaymentChartData = (
    data: MonthlyPayment[],
    setPaymentChartData: React.Dispatch<React.SetStateAction<{ type: string; category: string; total: number }[]>>
  ) => {
    const categoryTotals: { [key: string]: { [key: string]: number } } = {
      "Dépense": {},
      "Crédit": {}
    };

    data.forEach((t) => {
      if (!categoryTotals[t.type][t.category]) {
        categoryTotals[t.type][t.category] = 0;
      }
      categoryTotals[t.type][t.category] += t.amount;
    });

    const result = Object.keys(categoryTotals).flatMap((type) =>
      Object.keys(categoryTotals[type]).map((category) => ({
        type,
        category,
        total: categoryTotals[type][category],
      }))
    );

    setPaymentChartData(result);
  };

  processPaymentChartData(payments, setPaymentChartData);
}, [payments]);

  // ...existing code...
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
              <Link href="/Pages_Budget/mensuel" className="bg-blue-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-blue-700">Mensuel</Link>
              <Link href="/Pages_Budget/pdf_save" className="bg-red-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-red-700">Save PDF</Link>
              <Link href="/Pages_Budget/pdf_view" className="bg-red-500 text-white px-4 py-2 rounded-md text-white-500 hover:bg-red-700">Voir PDF</Link>
              <Link href="/Pages_Budget/goals" className="bg-green-700 text-white px-4 py-2 rounded-md text-white-500 hover:bg-green-700 border-2 border-black">Finances</Link>
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

      <h1 className="lg:pt-16 pt-20 text-2xl font-bold text-center flex-1">🎯 Visualisation des finances 🎯</h1>
  
      {/* Filtres */}
      <div className="flex space-x-4 justify-center my-4">
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="p-2 border rounded">
          {monthNames.map((month, i) => (
            <option key={i + 1} value={i + 1}>{month}</option>
          ))}
        </select>
        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="p-2 border rounded">
          {[...Array(5)].map((_, i) => (
            <option key={i} value={selectedYear - i}>{selectedYear - i}</option>
          ))}
        </select>
      </div>
  
      <div className="flex flex-wrap justify-between">
        {[{ title: "Dépenses", data: chartData }, { title: "Crédits", data: creditChartData }].map(({ title, data }, index) => {
          const totalAmount = data.reduce((total, entry) => total + entry.total, 0);
          return (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md my-6 w-full md:w-1/2">
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
                          <td className="border px-4 py-2">{entry.total.toFixed(2)}€</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-300 font-bold text-center">
                        <td className="border px-4 py-2">Total</td>
                        <td className="border px-4 py-2">{totalAmount}€</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}

        {/* New section for Monthly Payments */}
        {["Dépense", "Crédit"].map((type) => {
          const filteredData = paymentChartData.filter((entry) => entry.type === type);
          const totalAmount = filteredData.reduce((total, entry) => total + entry.total, 0);
          return (
            <div key={type} className="bg-white p-4 rounded-lg shadow-md my-6 w-full md:w-1/2">
              <h2 className="text-xl font-semibold mb-4">{type}s mensuels par Catégorie</h2>
              <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
                <div className="w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={filteredData}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {filteredData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={(type === "Dépense" ? categoryColorsExpense : categoryColorsCredits)[entry.category] || "#ccc"} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}€`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2">
                  <h2 className="text-xl font-semibold mb-4">Détails des {type}s mensuels</h2>
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200 text-center border border-black">
                        <th className="border px-4 py-2">Catégorie</th>
                        <th className="border px-4 py-2">Montant (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((entry) => (
                        <tr 
                          key={entry.category} 
                          className="border-b text-black text-center" 
                          style={{ backgroundColor: `${(type === "Dépense" ? categoryColorsExpense : categoryColorsCredits)[entry.category] || "#ccc"}` }}
                        >
                          <td className="border px-4 py-2">{entry.category}</td>
                          <td className="border px-4 py-2">{entry.total.toFixed(2)}€</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-300 font-bold text-center">
                        <td className="border px-4 py-2">Total</td>
                        <td className="border px-4 py-2">{totalAmount}€</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}

      </div>
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