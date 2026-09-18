import React from 'react';
import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import Providers from '@/components/Providers';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'SGAA — Sistema de Gestão de Abastecimento de Água',
  description: 'Plataforma interna para gestão de clientes, pontos de abastecimento, serviços, entregas e pagamentos de água em Moçambique.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" className={dmSans.variable}>
      <body className={dmSans.className}>
        <Providers>
          {children}
        </Providers>
</body>
    </html>
  );
}