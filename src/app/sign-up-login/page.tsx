import React from 'react';
import LoginForm from '@/app/sign-up-login/components/LoginForm';
import LoginBranding from '@/app/sign-up-login/components/LoginBranding';

export default function SignUpLoginPage() {
  return (
    <div className="min-h-screen flex bg-background">
      <LoginBranding />
      <LoginForm />
    </div>
  );
}