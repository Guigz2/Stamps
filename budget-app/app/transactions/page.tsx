"use client";

import { useState } from 'react';

// Définition du type Transaction
interface Transaction {
  description: string;
  amount: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState<Transaction>({ description: '', amount: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTransactions([...transactions, formData]);
    setFormData({ description: '', amount: '' });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">📜 Mes Transactions</h1>
      <p className="text-gray-600 mt-2">Ici, vous pourrez voir toutes vos transactions.</p>

      <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-100 rounded-lg">
        <div className="mb-2">
          <label className="block text-sm font-medium">Description</label>
          <input 
            type="text" 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            className="w-full p-2 border rounded" 
            required
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Montant</label>
          <input 
            type="number" 
            name="amount" 
            value={formData.amount} 
            onChange={handleChange} 
            className="w-full p-2 border rounded" 
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">Ajouter</button>
      </form>

      <ul className="mt-4">
        {transactions.map((transaction, index) => (
          <li key={index} className="p-2 border-b">
            {transaction.description} - {transaction.amount}€
          </li>
        ))}
      </ul>
    </div>
  );
}
