import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import ReceivedOffersTable from './ReceivedOffersTable';
import DashboardListings from './DashboardListings';

async function getUserData(userId) {
  try {
    // Get user's listings
    const [listings] = await pool.query(
      `SELECT l.*, c.name as category_name
       FROM listings l
       JOIN categories c ON l.category_id = c.category_id
       WHERE l.seller_id = ?
       ORDER BY l.created_at DESC`,
      [userId]
    );

    // Get user's received offers
    const [receivedOffers] = await pool.query(
      `SELECT o.*, l.title as listing_title, u.username as buyer_name
       FROM offers o
       JOIN listings l ON o.listing_id = l.listing_id
       JOIN users u ON o.buyer_id = u.user_id
       WHERE l.seller_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    // Get user's sent offers
    const [sentOffers] = await pool.query(
      `SELECT o.*, l.title as listing_title, u.username as seller_name
       FROM offers o
       JOIN listings l ON o.listing_id = l.listing_id
       JOIN users u ON l.seller_id = u.user_id
       WHERE o.buyer_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    // Get user's transactions
    const [transactions] = await pool.query(
      `SELECT t.*, l.title as listing_title, u2.username as buyer_name,
              CASE
                WHEN t.buyer_id = ? THEN 'Purchase'
                ELSE 'Sale'
              END as transaction_type
       FROM transactions t
       JOIN listings l ON t.listing_id = l.listing_id
       JOIN users u1 ON t.seller_id = u1.user_id
       JOIN users u2 ON t.buyer_id = u2.user_id
       WHERE t.seller_id = ? OR t.buyer_id = ?
       ORDER BY t.transaction_date DESC`,
      [userId, userId, userId]
    );

    return {
      listings,
      receivedOffers,
      sentOffers,
      transactions,
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      listings: [],
      receivedOffers: [],
      sentOffers: [],
      transactions: [],
    };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Please log in to view your dashboard
        </h1>
        <Link
          href="/login"
          className="text-blue-500 hover:text-blue-600"
        >
          Go to Login
        </Link>
      </div>
    );
  }
  const userId = session.user.id;
  const { listings, receivedOffers, sentOffers, transactions } = await getUserData(userId);

  // Enhance receivedOffers with transaction info
  const offersWithTransaction = receivedOffers.map(offer => {
    const transaction = transactions.find(
      t => t.offer_id === offer.offer_id
    );
    return { ...offer, transaction };
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/listings/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Create New Listing
        </Link>
      </div>

      {/* My Listings */}
      <section>
        <h2 className="text-2xl font-bold mb-4">My Listings</h2>
        <DashboardListings initialListings={listings} />
      </section>

      {/* Received Offers */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Received Offers</h2>
        <ReceivedOffersTable offersWithTransaction={offersWithTransaction} />
      </section>

      {/* Sent Offers */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Sent Offers</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offer Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sentOffers.map((offer) => (
                <tr key={offer.offer_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {offer.listing_title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {offer.seller_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${offer.offer_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        offer.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : offer.status === 'Accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {offer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(offer.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transactions */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Other Party
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.transaction_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.listing_title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.transaction_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.buyer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ${transaction.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
} 