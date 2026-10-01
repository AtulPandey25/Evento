import Link from 'next/link';
import { CalendarDays, Ticket } from 'lucide-react';
import { LoginForm } from '@/features/auth/components/login-form';

type LoginPageProps = {
  searchParams?: Promise<{
    role?: string;
  }>;
};

function getLoginMode(role?: string): 'default' | 'organizer' {
  return role?.toUpperCase() === 'ORGANIZER' ? 'organizer' : 'default';
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const mode = getLoginMode(params?.role);
  const isOrganizerMode = mode === 'organizer';

  return (
    <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-8">
        <p className="text-sm font-medium text-[#ff5a3d]">
          {isOrganizerMode ? 'Organizer access' : 'Welcome back'}
        </p>
        <h2 className="mt-2 text-3xl font-semibold">
          {isOrganizerMode ? 'Sign in to organizer workspace' : 'Sign in'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {isOrganizerMode
            ? 'Continue to event listings, booking manifests, and check-in tools.'
            : 'Continue to your customer tickets or organizer event tools.'}
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
            <Ticket className="mb-2 size-4 text-[#ff5a3d]" />
            <div className="text-sm font-medium">Customer</div>
            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Opens the marketplace, checkout, and ticket wallet.
            </p>
          </div>
          <div
            className={
              isOrganizerMode
                ? 'rounded-md border border-zinc-950 bg-zinc-950 p-3 text-white'
                : 'rounded-md border border-zinc-200 bg-zinc-50 p-3'
            }
          >
            <CalendarDays className="mb-2 size-4 text-[#ff5a3d]" />
            <div className="text-sm font-medium">Organizer</div>
            <p
              className={
                isOrganizerMode
                  ? 'mt-1 text-xs leading-5 text-zinc-300'
                  : 'mt-1 text-xs leading-5 text-zinc-600'
              }
            >
              Opens event listings, bookings, and check-in tools.
            </p>
          </div>
        </div>
      </div>

      <LoginForm
        createAccountHref={isOrganizerMode ? '/register?role=organizer' : '/register'}
        createAccountLabel={isOrganizerMode ? 'Create organizer account' : 'Create one'}
      />

      <Link
        className="mt-6 inline-flex text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline"
        href="/events"
      >
        Back to events
      </Link>
    </section>
  );
}
