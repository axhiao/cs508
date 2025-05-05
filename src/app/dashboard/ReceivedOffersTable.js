"use client";

import OfferAction from './OfferAction';

export default function ReceivedOffersTable({ offersWithTransaction }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {offersWithTransaction.map((offer) => {
            const listingOffers = offersWithTransaction.filter(o => o.listing_id === offer.listing_id);
            return (
              <tr key={offer.offer_id}>
                <td className="px-6 py-4 whitespace-nowrap">{offer.listing_title}</td>
                <td className="px-6 py-4 whitespace-nowrap">{offer.buyer_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">${offer.offer_amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    offer.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : offer.status === 'Accepted'
                      ? 'bg-green-100 text-green-800'
                      : offer.status === 'Completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {offer.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(offer.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <OfferAction offer={offer} listingOffers={listingOffers} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 