import React from 'react';
import { Droplets, Shield, BarChart3, Users } from 'lucide-react';


const features = [
  { id: 'feat-clients', icon: <Users size={18} />, text: 'Gestão de clientes e contratos' },
  { id: 'feat-supply', icon: <Droplets size={18} />, text: 'Controlo de abastecimentos em tempo real' },
  { id: 'feat-reports', icon: <BarChart3 size={18} />, text: 'Relatórios financeiros e operacionais' },
  { id: 'feat-security', icon: <Shield size={18} />, text: 'Acesso seguro por perfil de utilizador' },
];

export default function LoginBranding() {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0c4a6e 0%, #0369a1 40%, #0ea5e9 100%)' }}>
      {/* Decorative circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7dd3fc, transparent)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
      <div className="absolute top-1/2 -right-16 w-64 h-64 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #e0f2fe, transparent)' }} />

      <div className="relative z-10 flex flex-col justify-between p-12 w-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Droplets size={22} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-xl tracking-tight">SGAA</span>
            <p className="text-blue-200 text-xs">Sistema de Gestão de Abastecimento de Água</p>
          </div>
        </div>

        {/* Main content */}
        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Gestão hídrica<br />
            <span className="text-blue-200">inteligente e eficiente</span>
          </h1>
          <p className="text-blue-100 text-base leading-relaxed mb-10 max-w-md">
            Plataforma integrada para gestão de clientes, pontos de abastecimento, serviços e pagamentos — desenvolvida para operadoras de água em Moçambique.
          </p>

          <div className="space-y-3">
            {features?.map(f => (
              <div key={f?.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-blue-100 flex-shrink-0">
                  {f?.icon}
                </div>
                <span className="text-blue-100 text-sm">{f?.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-blue-300 text-xs">
          © 2026 SGAA · Versão 2.1.0 · Moçambique
        </div>
      </div>
    </div>
  );
}