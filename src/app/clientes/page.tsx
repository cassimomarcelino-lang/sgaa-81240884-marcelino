import AppLayout from '@/components/AppLayout';
import ClientesManagementClient from '@/app/clientes/components/ClientesManagementClient';

export const metadata = { title: 'Clientes — SGAA' };

export default function ClientesPage() {
  return (
    <AppLayout>
      <ClientesManagementClient />
    </AppLayout>
  );
}
