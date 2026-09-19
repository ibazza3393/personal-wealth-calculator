import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Sign in · Next Wealth' };

export default function SignInPage() {
  return (
    <main className="auth-stage">
      <AuthForm mode="signin" />
    </main>
  );
}
