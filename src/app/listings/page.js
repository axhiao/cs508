import Link from 'next/link';
import pool from '@/lib/db';

async function getCategories() {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    return rows;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

async function getListings({ category, minPrice, maxPrice, condition }) {
  try {
    let query = `
      SELECT l.*, c.name as category_name, u.username as seller_name,
        (SELECT image_url FROM listing_images WHERE listing_id = l.listing_id AND is_primary = TRUE LIMIT 1) as main_image
      FROM listings l
      JOIN categories c ON l.category_id = c.category_id
      JOIN users u ON l.seller_id = u.user_id
      WHERE l.is_available = true
    `;
    const params = [];

    if (category) {
      query += ' AND c.category_id = ?';
      params.push(category);
    }

    if (minPrice) {
      query += ' AND l.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND l.price <= ?';
      params.push(maxPrice);
    }

    if (condition) {
      query += ' AND l.condition_type = ?';
      params.push(condition);
    }

    query += ' ORDER BY l.created_at DESC';

    console.log(query);
    console.log(params);
    const [rows] = await pool.query(query, params);
    console.log(rows);
    return rows;
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

export default async function ListingsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category ?? null;
  const minPrice = resolvedSearchParams.minPrice ?? null;
  const maxPrice = resolvedSearchParams.maxPrice ?? null;
  const condition = resolvedSearchParams.condition ?? null;

  const filters = { category, minPrice, maxPrice, condition };

  const listings = await getListings(filters);
  const categories = await getCategories();

  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Browse Listings</h1>
        <Link
          href="/listings/create"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Create Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
              <select
                name="condition"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Conditions</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
            >
              Apply Filters
            </button>
          </form>
        </div>

        {/* Listings Grid */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.listing_id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {listing.main_image && (
                  <img
                    src={listing.main_image}
                    alt={listing.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {listing.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{listing.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      ${listing.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      {listing.condition_type}
                    </span>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>Category: {listing.category_name}</p>
                    <p>Seller: {listing.seller_name}</p>
                    <p>Location: {listing.location}</p>
                  </div>
                  <Link
                    href={`/listings/${listing.listing_id}`}
                    className="mt-4 block text-center bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 