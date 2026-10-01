import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/register-form';

type RegisterPageProps = {
  searchParams?: Promise<{
    role?: string;
  }>;
};

function getInitialRole(role?: string): 'USER' | 'ORGANIZER' {
  return role?.toUpperCase() === 'ORGANIZER' ? 'ORGANIZER' : 'USER';
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const initialRole = getInitialRole(params?.role);

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-8">
        <p className="text-sm font-medium text-[#ff5a3d]">Create account</p>
        <h2 className="mt-2 text-3xl font-semibold">Join Evento</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Select Customer to book tickets or Organizer to manage event listings.
          Each account lands in a separate workspace after sign in.
        </p>
      </div>

      <RegisterForm initialRole={initialRole} />

      <Link
        className="mt-6 inline-flex text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline"
        href="/events"
      >
        Back to events
      </Link>
    </section>
  );
}
