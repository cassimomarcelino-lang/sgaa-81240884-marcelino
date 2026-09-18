import AppLayout from '@/components/AppLayout';
import ServicosManagementClient from '@/app/servicos/components/ServicosManagementClient';

export const metadata = { title: 'Serviços — SGAA' };

export default function ServicosPage() {
  return (
    <AppLayout>
      <ServicosManagementClient />
    </AppLayout>
  );
}
