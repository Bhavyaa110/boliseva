import React, { useState } from "react";

const LoanForm: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const [tenure, setTenure] = useState<number>(12);
  const [interest, setInterest] = useState<number>(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Loan Amount: ₹${amount}, Tenure: ${tenure} months, Interest: ${interest}%`);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded-2xl">
      <h2 className="text-2xl font-semibold mb-4">Loan Calculator</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Loan Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tenure (Months)</label>
          <input
            type="number"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-400"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
          <input
            type="number"
            value={interest}
            onChange={(e) => setInterest(Number(e.target.value))}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-400"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Calculate Loan
        </button>
      </form>
    </div>
  );
};

export default LoanForm;
