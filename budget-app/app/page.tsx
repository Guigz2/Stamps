"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const addMissingMonthlyPayments = async () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // Mois actuel (1-12)

  console.log("📅 Vérification des paiements manquants...");

  // 📌 1. Récupérer tous les paiements mensuels
  const { data: payments } = await supabase
    .from("monthly_payment")
    .select("id, desc, amount, category, type, created_at");

  if (!payments || payments.length === 0) return;

  // 📌 2. Trouver la dernière transaction/crédit ajouté
  const { data: lastTransaction } = await supabase
    .from("transactions")
    .select("date")
    .order("date", { ascending: false })
    .limit(1);

  const { data: lastCredit } = await supabase
    .from("credits")
    .select("date")
    .order("date", { ascending: false })
    .limit(1);

  let lastDate = null;
  if (lastTransaction && lastTransaction.length > 0) {
    lastDate = new Date(lastTransaction[0].date);
  }
  if (lastCredit && lastCredit.length > 0) {
    const lastCreditDate = new Date(lastCredit[0].date);
    if (!lastDate || lastCreditDate > lastDate) {
      lastDate = lastCreditDate;
    }
  }


  // 📌 Si aucune transaction/crédit enregistré, démarrer depuis le plus ancien "created_at"
  let oldestCreatedAt = new Date(currentYear, currentMonth - 2, 1); // Par défaut, commence le mois dernier
  payments.forEach((payment) => {
    const createdAtDate = new Date(payment.created_at);
    if (createdAtDate < oldestCreatedAt) {
      oldestCreatedAt = createdAtDate;
    }
  });

  if (!lastDate || lastDate < oldestCreatedAt) {
    lastDate = new Date(oldestCreatedAt);
  }

  // 📌 Vérifier tous les mois entre `created_at` et `lastDate`
  const missingMonths = [];
  while (lastDate.getFullYear() < currentYear || lastDate.getMonth() + 1 < currentMonth) {
    lastDate.setMonth(lastDate.getMonth() + 1); // Passer au mois suivant
    missingMonths.push({
      year: lastDate.getFullYear(),
      month: lastDate.getMonth() + 1, // (1-12)
    });
  }

  if (missingMonths.length === 0) return;

  // 📌 3. Ajouter les paiements pour chaque mois manquant
  for (const { year, month } of missingMonths) {
    const monthDate = new Date(year, month - 1, 1).toISOString().split("T")[0];

    const transactionsToInsert: Array<{ desc: string; amount: number; category: string; date: string }> = [];
    const creditsToInsert: Array<{ desc: string; amount: number; category: string; date: string }> = [];

    payments.forEach((payment) => {
      const createdAtDate = new Date(payment.created_at);
      if (createdAtDate.getFullYear() > year || (createdAtDate.getFullYear() === year && createdAtDate.getMonth() + 1 > month)) {
        return; // Ne pas ajouter un paiement avant sa création
      }

      if (payment.type === "Dépense") {
        transactionsToInsert.push({
          desc: payment.desc,
          amount: payment.amount,
          category: payment.category,
          date: monthDate,
        });
      } else if (payment.type === "Crédit") {
        creditsToInsert.push({
          desc: payment.desc,
          amount: payment.amount,
          category: payment.category,
          date: monthDate,
        });
      }
    });

    // ✅ Insertion dans transactions si c'est une dépense
    if (transactionsToInsert.length > 0) {
      await supabase.from("transactions").insert(transactionsToInsert);
    }

    // ✅ Insertion dans crédits si c'est un crédit
    if (creditsToInsert.length > 0) {
      await supabase.from("credits").insert(creditsToInsert);
    }
  }
};
/*
export default function Home() {
  // 📌 Exécuter au chargement de la page d'accueil
  useEffect(() => {
    addMissingMonthlyPayments();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Liste des applications</h1>
      <nav className="space-y-4 text-lg text-center">
        <Link href="/Pages_Budget/goals" className="block text-blue-500">Application Budget</Link>
        <Link href="/Pages_Taches" className="block text-blue-500">Application Tâches</Link>
      </nav>
    </div>
  );
}
*/

// app/page.tsx (ou pages/index.tsx selon ton setup)
export default function Home() {
  useEffect(() => {
    addMissingMonthlyPayments();
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const apps = [
    {
      title: 'Budget App',
      color: 'from-red-500 to-orange-500',
      image: '/budget-icon.png',
      href: '/Pages_Budget/goals',
    },
    {
      title: 'Tasking App',
      color: 'from-blue-500 to-cyan-500',
      image: '/tasking-icon.png',
      href: '/Pages_Taches',
    },
    {
      title: 'Supermarket App',
      color: 'from-green-500 to-lime-500',
      image: '/supermarket-icon.png',
      href: '/supermarket',
    },
  ];

  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-pink-400 to-purple-600 py-12 text-center">
        <h1 style={{ fontFamily: '"Press Start 2P", cursive, Arial, Helvetica, sans-serif' }}
            className="text-3xl md:text-5xl font-bold text-white">
          Select your application
        </h1>
      </div>

      {/* App Cards */}
      <div className="flex flex-wrap justify-center gap-8 p-8">
        {apps.map((app) => (
          <a
            key={app.title}
            href={app.href}
            className={`w-80 h-24 rounded-lg bg-gradient-to-br ${app.color} shadow-md hover:scale-105 transition-transform flex items-center gap-4 px-4`}
          >
            <img src={app.image} alt={app.title} className="h-16 w-16" />
            <span style={{ fontFamily: '"Press Start 2P", cursive, Arial, Helvetica, sans-serif' }}
                  className="text-lg text-black">
              {app.title}
            </span>
          </a>
        ))}
      </div>
    </main>
  );
}
