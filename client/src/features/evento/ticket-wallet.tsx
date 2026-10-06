'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  KeyRound,
  Loader2,
  MapPin,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Badge,
  EmptyState,
  Panel,
  TicketQrCode,
  TicketSummary,
  formatDate,
  formatDay,
  formatMoney,
  formatTicketStatus,
  pluralizeTickets,
  statusTone,
} from './shared';

type TicketWalletProps = {
  isAuthenticated: boolean;
  isLoading: boolean;
  tickets: TicketSummary[];
  bookingConfirmation?: {
    code: string;
    eventTitle?: string;
    quantity: number;
  };
  readyTicketCount: number;
  walletTotal: number;
  nextTicketDate?: string;
  cancellingTicketId: string | null;
  onCancelTicket: (ticketId: string) => void;
};

export function TicketWallet({
  isAuthenticated,
  isLoading,
  tickets,
  bookingConfirmation,
  readyTicketCount,
  walletTotal,
  nextTicketDate,
  cancellingTicketId,
  onCancelTicket,
}: TicketWalletProps) {
  const [confirmingTicketId, setConfirmingTicketId] = useState<string | null>(null);
  const isAnyTicketCancelling = cancellingTicketId !== null;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Your tickets</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Saved passes for entry, cancellations, and check-in status.
          </p>
        </div>
        {isAuthenticated && tickets.length > 0 && (
          <Badge tone="blue">
            {tickets.length === 1 ? '1 saved pass' : `${tickets.length} saved passes`}
          </Badge>
        )}
      </div>

      {isAuthenticated && bookingConfirmation && (
        <section
          aria-label="Booking confirmation"
          className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-xs"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white">
                <BadgeCheck className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-semibold">Booking confirmed</h3>
                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  {pluralizeTickets(bookingConfirmation.quantity)} saved to your wallet
                  {bookingConfirmation.eventTitle ? ` for ${bookingConfirmation.eventTitle}` : ''}.
                </p>
              </div>
            </div>
            <div className="rounded-md border border-emerald-200 bg-white/70 px-3 py-2">
              <div className="text-xs uppercase text-emerald-700">Entry code</div>
              <div className="mt-1 break-all font-mono text-sm font-semibold">
                {bookingConfirmation.code}
              </div>
            </div>
          </div>
        </section>
      )}

      {!isAuthenticated ? (
        <EmptyState
          title="Sign in to open your wallet"
          detail="Ticket ownership is connected to the authenticated account."
        />
      ) : isLoading ? (
        <Panel className="flex h-52 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-zinc-500" />
        </Panel>
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          detail="Book an event from Browse and your passes will appear here."
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Panel className="p-4">
              <div className="text-2xl font-semibold">{readyTicketCount}</div>
              <div className="mt-1 text-sm text-zinc-600">ready for entry</div>
            </Panel>
            <Panel className="p-4">
              <div className="text-2xl font-semibold">{formatMoney(walletTotal)}</div>
              <div className="mt-1 text-sm text-zinc-600">wallet value</div>
            </Panel>
            <Panel className="p-4">
              <div className="text-2xl font-semibold">
                {nextTicketDate ? formatDay(nextTicketDate).day : '--'}
              </div>
              <div className="mt-1 text-sm text-zinc-600">
                {nextTicketDate ? `${formatDay(nextTicketDate).month} next event` : 'no dates'}
              </div>
            </Panel>
          </div>

          {tickets.map((ticket) => {
            const isCancelling = cancellingTicketId === ticket.id;
            const isConfirmingCancellation = confirmingTicketId === ticket.id;

            return (
              <section
                key={ticket.id}
                className="grid overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm md:grid-cols-[1fr_270px]"
              >
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone(ticket.status)}>
                      {formatTicketStatus(ticket.status)}
                    </Badge>
                    <span className="text-sm text-zinc-500">
                      {pluralizeTickets(ticket.quantity)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold">
                    {ticket.eventTitle || ticket.eventId}
                  </h3>
                  <div className="mt-4 grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-zinc-500" />
                      {formatDate(ticket.eventDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-zinc-500" />
                      {ticket.eventLocation || 'Venue unavailable'}
                    </div>
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="size-4 text-zinc-500" />
                      {formatMoney(ticket.totalPrice)}
                    </div>
                    <div className="flex items-center gap-2">
                      <KeyRound className="size-4 text-zinc-500" />
                      <span className="font-mono">{ticket.ticketCode}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500">
                    {ticket.purchasedAt && <span>Purchased {formatDate(ticket.purchasedAt)}</span>}
                    {ticket.checkedInAt && <span>Checked in {formatDate(ticket.checkedInAt)}</span>}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {ticket.status !== 'CONFIRMED' && (
                      <span className="flex min-h-9 items-center text-sm text-zinc-500">
                        Only confirmed tickets can be cancelled.
                      </span>
                    )}
                    <Button
                      aria-label={`Cancel ticket ${ticket.ticketCode}`}
                      disabled={ticket.status !== 'CONFIRMED' || isAnyTicketCancelling}
                      onClick={() => setConfirmingTicketId(ticket.id)}
                      variant="outline"
                    >
                      {isCancelling && <Loader2 className="size-4 animate-spin" />}
                      {isCancelling ? 'Cancelling...' : 'Cancel ticket'}
                    </Button>
                  </div>
                  {isConfirmingCancellation && (
                    <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">
                      <div className="flex gap-3">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                        <div>
                          <div className="font-semibold">Cancel this ticket?</div>
                          <p className="mt-1 text-rose-800">
                            This removes the pass from your wallet. You can only cancel
                            confirmed tickets before check-in.
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          onClick={() => setConfirmingTicketId(null)}
                          type="button"
                          variant="outline"
                        >
                          Keep ticket
                        </Button>
                        <Button
                          aria-label={`Confirm cancellation for ticket ${ticket.ticketCode}`}
                          className="bg-rose-600 text-white hover:bg-rose-700"
                          disabled={isCancelling}
                          onClick={() => {
                            setConfirmingTicketId(null);
                            onCancelTicket(ticket.id);
                          }}
                          type="button"
                        >
                          Confirm cancellation
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start justify-between border-t border-dashed border-zinc-300 bg-zinc-950 p-5 text-white md:border-l md:border-t-0">
                  <div className="w-full">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                        Admission pass
                      </div>
                      <Ticket className="size-4 text-zinc-400" />
                    </div>
                    <div
                      aria-label={`Entry code ${ticket.ticketCode}`}
                      className="mt-3 rounded-md bg-white/10 p-3"
                    >
                      <div className="text-xs text-zinc-400">Entry code</div>
                      <div className="mt-1 break-all font-mono text-2xl font-semibold tracking-wider">
                        {ticket.ticketCode}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <TicketQrCode value={ticket.ticketCode} />
                    <div className="mt-3 max-w-40 text-xs leading-5 text-zinc-400">
                      Scan the QR or enter the code at the venue gate.
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
