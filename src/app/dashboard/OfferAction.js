"use client";

import { useState } from "react";

export default function OfferAction({ offer, listingOffers, refresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const acceptedOffer = listingOffers.find(
    (o) => o.status === "Accepted" || o.status === "Completed"
  );
  const isThisAccepted = offer.status === "Accepted" || offer.status === "Completed";
  const isOtherAccepted = acceptedOffer && !isThisAccepted;

  const handleAccept = async () => {
    setLoading(true);
    setError("");
    try {
      await fetch("/api/offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id: offer.offer_id, status: "Accepted" }),
      });
      await Promise.all(
        listingOffers
          .filter((o) => o.offer_id !== offer.offer_id && o.status === "Pending")
          .map((o) =>
            fetch("/api/offers", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ offer_id: o.offer_id, status: "Rejected" }),
            })
          )
      );
      // Try to complete the transaction, retrying if not found
      let completed = false;
      for (let i = 0; i < 5; i++) {
        const txRes = await fetch(`/api/transactions?offer_id=${offer.offer_id}`);
        const txs = await txRes.json();
        if (txs && txs.length > 0) {
          await fetch(`/api/transactions/${txs[0].transaction_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Completed" }),
          });
          completed = true;
          break;
        }
        await new Promise((res) => setTimeout(res, 300));
      }
      if (!completed) {
        setError("Transaction not found or could not be completed.");
      } else if (refresh) {
        refresh();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError("Operation failed, please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (offer.status === "Pending" && !acceptedOffer) {
    return (
      <>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Accept"}
        </button>
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      </>
    );
  }
  if (isOtherAccepted) {
    return (
      <button
        className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md cursor-not-allowed"
        disabled
      >
        Rejected
      </button>
    );
  }
  if (isThisAccepted) {
    return <span className="text-green-700 font-semibold">Accepted</span>;
  }
  return null;
} 