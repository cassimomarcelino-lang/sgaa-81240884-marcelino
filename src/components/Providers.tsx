'use client';

import React from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
}
