import AppLayout from '@/components/AppLayout';
import RelatoriosClient from '@/app/relatorios/components/RelatoriosClient';

export const metadata = { title: 'Relatórios — SGAA' };

export default function RelatoriosPage() {
  return (
    <AppLayout>
      <RelatoriosClient />
    </AppLayout>
  );
}
