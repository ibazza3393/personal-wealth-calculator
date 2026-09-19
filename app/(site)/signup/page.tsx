import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = { title: 'Create account · Next Wealth' };

export default function SignUpPage() {
  return (
    <main className="auth-stage">
      <AuthForm mode="signup" />
    </main>
  );
}
