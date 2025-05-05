import Link from 'next/link';
import MakeOffer from './MakeOffer';
import pool from '@/lib/db';

async function getListing(id) {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, c.name as category_name, u.username as seller_name, u.email as seller_email
       FROM listings l
       JOIN categories c ON l.category_id = c.category_id
       JOIN users u ON l.seller_id = u.user_id
       WHERE l.listing_id = ?`,
      [id]
    );
    const listing = rows[0];
    if (!listing) return null;
    // 查询所有图片
    const [images] = await pool.query(
      'SELECT image_url, is_primary FROM listing_images WHERE listing_id = ? ORDER BY is_primary DESC, image_id ASC',
      [id]
    );
    listing.images = images.map(img => img.image_url);
    return listing;
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

export default async function ListingPage({ params }) {

  const p = await params;
  const listing = await getListing(p.id);

  if (!listing) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Listing Not Found</h1>
        <Link
          href="/listings"
          className="text-blue-500 hover:text-blue-600"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {listing.title}
              </h1>
              <p className="text-gray-600">{listing.description}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-600">
                ${listing.price}
              </span>
              <p className="text-sm text-gray-500 mt-1">
                Condition: {listing.condition_type}
              </p>
            </div>
          </div>

          {listing.images && listing.images.length > 0 && (
            <div className="mb-6">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full max-h-96 object-contain rounded"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Item Details
              </h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Category</dt>
                  <dd className="text-sm text-gray-900">{listing.category_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="text-sm text-gray-900">{listing.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Listed On</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Seller Information
              </h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Seller</dt>
                  <dd className="text-sm text-gray-900">{listing.seller_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contact</dt>
                  <dd className="text-sm text-gray-900">{listing.seller_email}</dd>
                </div>
              </dl>
              <Link href={`/messages?userId=${listing.seller_id}`} className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Send Message</Link>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/listings"
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Listings
            </Link>
            <MakeOffer listingId={listing.listing_id} price={listing.price} />
          </div>
        </div>
      </div>
    </div>
  );
} 