import React from 'react';
import Sidebar from '@/components/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  userRole?: 'Administrador' | 'Funcionário';
  userName?: string;
  userEmail?: string;
}

export default function AppLayout({ children, userRole = 'Administrador', userName = 'Carlos Machava', userEmail = 'carlos@sgaa.co.mz' }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userRole={userRole} userName={userName} userEmail={userEmail} />
      <main className="flex-1 min-w-0 overflow-x-hidden pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}