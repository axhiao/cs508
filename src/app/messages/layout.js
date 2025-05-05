'use client';
import { Suspense } from 'react';

export default function MessagesLayout({ children }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
} 