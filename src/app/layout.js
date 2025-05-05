'use client';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { useSession, signOut, SessionProvider } from 'next-auth/react';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      <InnerLayout>{children}</InnerLayout>
    </SessionProvider>
  );
}

function InnerLayout({ children }) {
  const { data: session, status } = useSession();

  // console.log(session.user.id, session.user.name, session.user.email);

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/" className="flex items-center">
                  <span className="text-xl font-bold text-gray-800">Used Goods Trading</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/listings" className="text-gray-600 hover:text-gray-900">Browse Listings</Link>
                {status === 'loading' ? null : session?.user ? (
                  <>
                    <Link href="/messages" className="text-gray-600 hover:text-gray-900">Messages</Link>
                    <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                      <UserBalanceTooltip userId={session.user.id} username={session.user.name || session.user.email?.split('@')[0]} />
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
                    <Link href="/register" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white mt-8">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <p className="text-center">&copy; 2024 Used Goods Trading Platform. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

function UserBalanceTooltip({ userId, username }) {
  const [show, setShow] = useState(false);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (balance !== null || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      setBalance(data.wallet_balance);
    } catch (e) {
      setBalance('Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <span
      className="relative cursor-pointer text-gray-600 hover:text-gray-900"
      onMouseEnter={() => { setShow(true); fetchBalance(); }}
      onMouseLeave={() => setShow(false)}
    >
      {username}
      {show && (
        <span className="absolute left-1/2 -translate-x-1/2 mt-7 px-3 py-2 bg-white border border-gray-300 rounded shadow text-sm z-50 whitespace-nowrap pointer-events-none">
          {loading ? 'Loading...' : balance !== null ? `Balance: $${balance}` : 'Unable to fetch balance'}
        </span>
      )}
    </span>
  );
}
