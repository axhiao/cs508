"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardListings({ initialListings }) {
  const [listings, setListings] = useState(initialListings);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const conditionOptions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  const router = useRouter();

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  // 刷新数据
  const refresh = async () => {
    setLoading(true);
    const res = await fetch('/api/dashboard-listings');
    const data = await res.json();
    setListings(data);
    setLoading(false);
  };

  // 删除
  const handleDelete = async (id) => {
    setLoading(true);
    await fetch(`/api/listings?id=${id}`, { method: 'DELETE' });
    setDeleteId(null);
    await refresh();
  };

  // 编辑
  const handleEdit = (listing) => {
    setEditId(listing.listing_id);
    setEditForm({ ...listing });
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/listings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...editForm,
        id: editId,
        category_id: Number(editForm.category_id),
        price: Number(editForm.price),
      }),
    });
    setEditId(null);
    await refresh();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <div key={listing.listing_id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{listing.title}</h3>
            <p className="text-gray-600 mb-4">{listing.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-blue-600">${listing.price}</span>
              <span className="text-sm text-gray-500">{listing.condition_type}</span>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p>Category: {listing.category_name}</p>
              <p>Status: {listing.is_available ? 'Available' : 'Sold'}</p>
            </div>
            <Link href={`/listings/${listing.listing_id}`} className="mt-4 block text-center bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200">View Details</Link>
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEdit(listing)} className="flex-1 bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500">Edit</button>
              <button onClick={() => setDeleteId(listing.listing_id)} className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
            </div>
          </div>
          {/* 编辑弹窗 */}
          {editId === listing.listing_id && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <form onSubmit={handleEditSubmit} className="bg-white p-6 rounded shadow w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold mb-2">Edit Listing</h2>
                <input className="w-full border p-2 rounded" value={editForm.title || ''} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" required />
                <textarea className="w-full border p-2 rounded" value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description" required />
                <input className="w-full border p-2 rounded" type="number" value={editForm.price || ''} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} placeholder="Price" required />
                <select className="w-full border p-2 rounded" value={editForm.category_id || ''} onChange={e => setEditForm(f => ({ ...f, category_id: e.target.value }))} required>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                  ))}
                </select>
                <select className="w-full border p-2 rounded" value={editForm.condition_type || ''} onChange={e => setEditForm(f => ({ ...f, condition_type: e.target.value }))} required>
                  <option value="">Select Condition</option>
                  {conditionOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <input className="w-full border p-2 rounded" value={editForm.location || ''} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" required />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Save</button>
                  <button type="button" onClick={() => setEditId(null)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
                </div>
              </form>
            </div>
          )}
          {/* 删除确认弹窗 */}
          {deleteId === listing.listing_id && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded shadow w-full max-w-sm">
                <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
                <p>Are you sure you want to delete this listing?</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleDelete(listing.listing_id)} className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Delete</button>
                  <button onClick={() => setDeleteId(null)} className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {loading && <div className="col-span-full text-center text-blue-500">Loading...</div>}
    </div>
  );
} 