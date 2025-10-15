import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { initiatePayout } from "../services/payoutService";
import { sendNotification } from "../services/notificationService";

export default function SellerWithdraw() {
  const { currentUser, userData } = useAuth();
  const [method, setMethod] = useState("bank");
  const [amount, setAmount] = useState("");
  const [walletAddr, setWalletAddr] = useState("");
  const [bankInfo, setBankInfo] = useState({ accountName: "", accountNumber: "", bankName: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  if (!currentUser || userData.role !== "Seller") {
    return <p className="text-center mt-8 text-red-600">Sellers only.</p>;
  }

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0 || amt > (userData.walletBalance || 0)) {
      setErr("Invalid amount.");
      return;
    }

    setLoading(true);
    try {
      const req = {
        uid: currentUser.uid,
        method,
        amount: amt,
        details: method === "bank" ? bankInfo : { walletAddr },
        status: "pending",
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, "withdrawRequests"), req);

      // Initiate payout backend call
      await initiatePayout({ uid: currentUser.uid, method, amount: amt, details: req.details });

      // Deduct temporarily
      await updateDoc(doc(db, "users", currentUser.uid), {
        walletBalance: (userData.walletBalance || 0) - amt,
      });

      await sendNotification({
        uid: currentUser.uid,
        title: "Payout Requested",
        message: `Your ₦${amt} withdrawal is being processed.`,
        type: "payout",
      });

      setMsg("Withdrawal request sent successfully!");
      setAmount("");
    } catch (e) {
      console.error(e);
      setErr("Failed to request payout: " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Withdraw Funds</h1>
      {msg && <p className="bg-green-100 text-green-700 p-3 rounded">{msg}</p>}
      {err && <p className="bg-red-100 text-red-700 p-3 rounded">{err}</p>}

      <p>Wallet Balance: ₦{Number(userData.walletBalance || 0).toLocaleString()}</p>

      <form onSubmit={handleWithdraw} className="space-y-4">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="bank">Bank Account</option>
          <option value="crypto">Crypto Wallet</option>
        </select>

        {method === "bank" && (
          <>
            <input
              type="text"
              placeholder="Bank Name"
              value={bankInfo.bankName}
              onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Account Name"
              value={bankInfo.accountName}
              onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Account Number"
              value={bankInfo.accountNumber}
              onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </>
        )}

        {method === "crypto" && (
          <input
            type="text"
            placeholder="USDT / BTC Wallet Address"
            value={walletAddr}
            onChange={(e) => setWalletAddr(e.target.value)}
            className="w-full p-2 border rounded"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Processing..." : "Withdraw"}
        </button>
      </form>
    </div>
  );
}
