'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ManageOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers?type=received');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch offers');
      }

      setOffers(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferAction = async (offerId, status) => {
    try {
      const response = await fetch('/api/offers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offer_id: offerId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update offer');
      }

      // Refresh the offers list
      fetchOffers();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Offers</h1>
        <p className="text-gray-600">
          Review and respond to offers you've received for your listings.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {offers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No offers received yet.</p>
          <Link
            href="/listings"
            className="text-blue-600 hover:text-blue-800 mt-4 inline-block"
          >
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {offers.map((offer) => (
            <div
              key={offer.offer_id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {offer.listing_title}
                  </h2>
                  <p className="text-gray-600">
                    Offered by {offer.buyer_name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    ${offer.offer_amount}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(offer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {offer.status === 'Pending' ? (
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => handleOfferAction(offer.offer_id, 'Rejected')}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleOfferAction(offer.offer_id, 'Accepted')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Accept
                  </button>
                </div>
              ) : (
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      offer.status === 'Accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {offer.status}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 