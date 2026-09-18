import AppLayout from '@/components/AppLayout';
import ChangelogClient from './components/ChangelogClient';

export const metadata = { title: 'Histórico de Funcionalidades — SGAA' };

export default function ChangelogPage() {
  return (
    <AppLayout>
      <ChangelogClient />
    </AppLayout>
  );
}
