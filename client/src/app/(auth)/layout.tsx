import Link from 'next/link';
import { CalendarDays, ClipboardList, ShieldCheck, Ticket } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-zinc-950">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[1fr_480px] lg:items-center">
        <section className="flex min-h-[520px] flex-col justify-between rounded-xl border border-blue-900/40 bg-gradient-to-br from-[#0a1628] via-[#0f2444] to-[#14325c] p-6 text-white shadow-xl shadow-blue-950/20 lg:p-8">
          <div>
            <Link className="inline-flex items-center gap-3" href="/events">
              <span className="flex size-10 items-center justify-center rounded-md bg-[#ff5a3d] text-white">
                <Ticket className="size-5" />
              </span>
              <span className="text-lg font-semibold">Evento</span>
            </Link>

            <div className="mt-16 max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-300">
                Event ticketing
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight lg:text-5xl">
                Choose a customer or organizer workspace.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-blue-100/80">
                Customer accounts book tickets and manage passes. Organizer
                accounts publish listings and validate entry at the door.
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-sm text-blue-100/90 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-800/40 bg-blue-950/40 p-4">
              <Ticket className="mb-3 size-5 text-[#ff8a72]" />
              Customers browse shows, book seats, and open wallet passes.
            </div>
            <div className="rounded-lg border border-blue-800/40 bg-blue-950/40 p-4">
              <CalendarDays className="mb-3 size-5 text-[#ff8a72]" />
              Organizers publish listings, review bookings, and check in guests.
            </div>
            <div className="rounded-lg border border-blue-800/40 bg-blue-950/40 p-4">
              <ClipboardList className="mb-3 size-5 text-[#ff8a72]" />
              Booking manifests connect customer tickets to event operations.
            </div>
            <div className="rounded-lg border border-blue-800/40 bg-blue-950/40 p-4">
              <ShieldCheck className="mb-3 size-5 text-[#ff8a72]" />
              Kafka-backed workflows stay behind the booking experience.
            </div>
          </div>
        </section>

        <section className="w-full">{children}</section>
      </div>
    </main>
  );
}
