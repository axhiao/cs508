'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function MakeOffer({ listingId, price }) {
  const { data: session, status } = useSession();
  console.log('session in MakeOffer:', session);
  const [offerAmount, setOfferAmount] = useState(price);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session || !session.user) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, offer_amount: offerAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to make offer');
      }
      setSuccess('Offer submitted successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="number"
        min="0"
        step="0.01"
        value={offerAmount}
        onChange={e => setOfferAmount(e.target.value)}
        className="w-28 rounded-md border border-gray-300 px-2 py-1 focus:border-blue-500 focus:ring-blue-500"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Make Offer'}
      </button>
      {success && <span className="ml-2 text-green-600">{success}</span>}
      {error && <span className="ml-2 text-red-600">{error}</span>}
    </form>
  );
} 