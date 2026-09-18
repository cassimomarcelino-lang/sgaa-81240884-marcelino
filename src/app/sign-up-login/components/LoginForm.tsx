'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Copy, Check, LogIn, Droplets } from 'lucide-react';
import { toast } from 'sonner';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const mockCredentials = [
  { id: 'cred-admin', role: 'Administrador', email: 'admin@sgaa.co.mz', password: 'Admin@2026' },
  { id: 'cred-func', role: 'Funcionário', email: 'joana.sitoe@sgaa.co.mz', password: 'Func@2026' },
];

// Backend integration point: replace with actual auth API call
const mockLogin = async (email: string, password: string): Promise<{ success: boolean; role: string }> => {
  await new Promise(r => setTimeout(r, 1200));
  const found = mockCredentials.find(c => c.email === email && c.password === password);
  if (found) return { success: true, role: found.role };
  return { success: false, role: '' };
};

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({ defaultValues: { rememberMe: false } });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await mockLogin(data.email, data.password);
      if (result.success) {
        toast.success(`Bem-vindo! A entrar como ${result.role}...`);
        setTimeout(() => router.push('/dashboard'), 800);
      } else {
        setError('email', {
          message: 'Credenciais inválidas — use as contas de demonstração abaixo para entrar',
        });
        setIsLoading(false);
      }
    } catch {
      toast.error('Erro de ligação. Verifique a sua rede e tente novamente.');
      setIsLoading(false);
    }
  };

  const autofill = (cred: typeof mockCredentials[0]) => {
    setValue('email', cred.email);
    setValue('password', cred.password);
    toast.info(`Credenciais de ${cred.role} preenchidas`);
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
      <div className="w-full max-w-md">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Droplets size={20} className="text-primary" />
          </div>
          <span className="font-bold text-lg text-foreground">SGAA</span>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">Iniciar sessão</h2>
          <p className="text-sm text-muted-foreground">Aceda ao painel de gestão de abastecimento</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Endereço de e-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="utilizador@sgaa.co.mz"
              className={`w-full px-3.5 py-2.5 text-sm bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors duration-150 ${
                errors.email ? 'border-red-400 focus:ring-red-400' : 'border-border'
              }`}
              {...register('email', {
                required: 'O e-mail é obrigatório',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato de e-mail inválido' },
              })}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-600 flex items-start gap-1">
                <span className="flex-shrink-0 mt-0.5">⚠</span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              Palavra-passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 pr-11 text-sm bg-card border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors duration-150 ${
                  errors.password ? 'border-red-400 focus:ring-red-400' : 'border-border'
                }`}
                {...register('password', {
                  required: 'A palavra-passe é obrigatória',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-600">⚠ {errors.password.message}</p>
            )}
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border text-primary focus:ring-ring accent-primary"
                {...register('rememberMe')}
              />
              <span className="text-sm text-muted-foreground">Manter sessão iniciada</span>
            </label>
            <button type="button" className="text-sm text-primary hover:underline font-medium">
              Esqueci a palavra-passe
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                <span>A verificar...</span>
              </>
            ) : (
              <>
                <LogIn size={17} />
                <span>Entrar no sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="mt-8 border border-border rounded-xl overflow-hidden bg-muted/40">
          <div className="px-4 py-2.5 border-b border-border bg-muted/60">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contas de demonstração</p>
          </div>
          <div className="divide-y divide-border">
            {mockCredentials.map(cred => (
              <div key={cred.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{cred.role}</p>
                  <p className="text-xs text-muted-foreground truncate">{cred.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cred.password, `${cred.id}-pw`)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-1 rounded hover:bg-muted"
                    title="Copiar palavra-passe"
                  >
                    {copiedField === `${cred.id}-pw` ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => autofill(cred)}
                    className="text-xs font-medium text-primary hover:text-primary/80 bg-primary/8 hover:bg-primary/15 px-2.5 py-1 rounded-md transition-all duration-150 active:scale-95"
                  >
                    Usar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao entrar, concorda com os{' '}
          <span className="text-primary hover:underline cursor-pointer">Termos de Utilização</span>
          {' '}e a{' '}
          <span className="text-primary hover:underline cursor-pointer">Política de Privacidade</span>
        </p>
      </div>
    </div>
  );
}