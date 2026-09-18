import AppLayout from '@/components/AppLayout';
import PontosManagementClient from '@/app/pontos-abastecimento/components/PontosManagementClient';

export const metadata = { title: 'Pontos de Abastecimento — SGAA' };

export default function PontosAbastecimentoPage() {
  return (
    <AppLayout>
      <PontosManagementClient />
    </AppLayout>
  );
}
