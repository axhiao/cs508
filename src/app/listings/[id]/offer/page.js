'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MakeOfferPage({ params }) {
  const router = useRouter();
  const [offerAmount, setOfferAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: params.id,
          offer_amount: parseFloat(offerAmount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create offer');
      }

      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Make an Offer</h1>
        <p className="text-gray-600">
          Enter your offer amount for this item. Make sure to consider the item&apos;s
          condition and market value.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="offerAmount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Offer Amount ($)
          </label>
          <input
            type="number"
            id="offerAmount"
            name="offerAmount"
            min="0"
            step="0.01"
            required
            value={offerAmount}
            onChange={(e) => setOfferAmount(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your offer amount"
          />
        </div>

        <div className="flex items-center justify-between">
          <Link
            href={`/listings/${params.id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Listing
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Offer'}
          </button>
        </div>
      </form>
    </div>
  );
} 