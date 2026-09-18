import AppLayout from '@/components/AppLayout';
import PagamentosManagementClient from '@/app/pagamentos/components/PagamentosManagementClient';

export const metadata = { title: 'Pagamentos — SGAA' };

export default function PagamentosPage() {
  return (
    <AppLayout>
      <PagamentosManagementClient />
    </AppLayout>
  );
}
