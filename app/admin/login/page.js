import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  if (await isAdmin()) redirect('/admin');
  const params = await searchParams;
  const next = typeof params?.next === 'string' ? params.next : '/admin';
  return <LoginForm next={next} />;
}
