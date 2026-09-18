import { getDashboardStats } from '@/lib/supabase/dashboard';

export default async function DashboardKPIs() {
  const stats = await getDashboardStats();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-4 bg-white rounded-xl shadow">Clientes: {stats.totalClientes}</div>
      <div className="p-4 bg-white rounded-xl shadow">Pontos: {stats.totalPontosAtivos}</div>
      <div className="p-4 bg-white rounded-xl shadow">Abastecimentos: {stats.totalAbastecimentos}</div>
      <div className="p-4 bg-white rounded-xl shadow">Receita: {stats.receitaTotal} MT</div>
    </div>
  );
}