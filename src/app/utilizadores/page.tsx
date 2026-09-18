import AppLayout from '@/components/AppLayout';
import UtilizadoresClient from '@/app/utilizadores/components/UtilizadoresClient';

export const metadata = { title: 'Utilizadores — SGAA' };

export default function UtilizadoresPage() {
  return (
    <AppLayout>
      <UtilizadoresClient />
    </AppLayout>
  );
}
