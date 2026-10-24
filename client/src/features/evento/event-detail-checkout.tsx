'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Flame,
  Loader2,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { Event } from '@/types';
import { EventoShell } from './evento-shell';
import {
  Badge,
  EmptyState,
  EventPoster,
  Panel,
  PurchaseResponse,
  formatDate,
  formatMoney,
  getEventCategory,
  getEventCity,
  getSeatAvailability,
  statusTone,
  views,
} from './shared';

const api = {
  get: <T,>(url: string) => apiClient.get<T>(url) as unknown as Promise<T>,
  post: <T,>(url: string, data?: unknown) =>
    apiClient.post<T>(url, data) as unknown as Promise<T>,
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'We could not complete that action.';
}

export function EventDetailCheckout({ eventId }: { eventId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [quantity, setQuantity] = useState(1);

  const eventQuery = useQuery({
    queryKey: ['events', eventId],
    queryFn: () => api.get<Event>(`/events/${eventId}`),
  });

  const purchaseMutation = useMutation({
    mutationFn: () =>
      api.post<PurchaseResponse>('/tickets/purchase', {
        eventId,
        quantity,
      }),
    onSuccess: (data) => {
      toast.success('Booking confirmed', {
        description: data.ticket.ticketCode,
      });
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
      ]);
      const confirmationParams = new URLSearchParams({
        booking: 'confirmed',
        code: data.ticket.ticketCode,
        event: data.ticket.eventTitle,
        quantity: String(data.ticket.quantity),
      });

      router.push(`/tickets?${confirmationParams.toString()}`);
    },
    onError: (error) => {
      toast.error('Could not complete booking', {
        description: getErrorMessage(error),
      });
    },
  });

  const event = eventQuery.data;
  const userRole = user?.role || 'USER';
  const isOrganizer = userRole === 'ORGANIZER' || userRole === 'ADMIN';
  const isCustomer = !isAuthenticated || userRole === 'USER';
  const canOpenSystem = userRole === 'ADMIN';
  const navItems = views.filter((item) => item.id !== 'organizer' || isOrganizer);
  const total = event ? event.price * quantity : 0;
  const canBook = Boolean(event && event.status === 'PUBLISHED' && isCustomer);
  const availability = event ? getSeatAvailability(event) : null;
  const remainingSeats = availability?.remainingSeats ?? 0;
  const soldTickets = availability?.soldTickets ?? 0;
  const maxPurchaseQuantity = event ? Math.min(remainingSeats, 10) : 1;
  const eventCategory = event ? getEventCategory(event, 0) : '';
  const eventCity = event ? getEventCity(event) : '';

  return (
    <EventoShell
      view="events"
      isOrganizerView={false}
      isAuthenticated={isAuthenticated}
      user={user}
      clearAuth={clearAuth}
      canOpenSystem={canOpenSystem}
      navItems={navItems}
    >
      <section className="space-y-5">
        <Button asChild variant="outline">
          <Link href="/events">
            <ArrowLeft className="size-4" />
            Back to events
          </Link>
        </Button>

        {eventQuery.isLoading ? (
          <Panel className="flex h-72 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-zinc-500" />
          </Panel>
        ) : !event ? (
          <EmptyState
            title="Event unavailable"
            detail="This listing could not be found. Browse current events to continue booking."
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              <Panel className="overflow-hidden">
                <EventPoster featured event={event} index={0} />
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone(event.status)}>{event.status}</Badge>
                    <Badge tone="blue">{eventCategory}</Badge>
                    {availability?.isFillingFast && (
                      <Badge tone="amber">
                        <Flame className="mr-1 size-3.5" />
                        Filling fast
                      </Badge>
                    )}
                    <span className="text-sm text-zinc-500">{formatMoney(event.price)}</span>
                  </div>
                  <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight">
                    {event.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
                    {event.description || 'Organizer details are not available.'}
                  </p>

                  <div className="mt-5 border-t border-zinc-200 pt-5">
                    <div className="grid gap-4 text-sm md:grid-cols-3">
                      <div className="flex gap-3">
                        <CalendarDays className="mt-0.5 size-5 shrink-0 text-zinc-500" />
                        <div>
                          <div className="font-medium">{formatDate(event.date)}</div>
                          <div className="mt-1 text-xs text-zinc-500">Showtime</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <MapPin className="mt-0.5 size-5 shrink-0 text-zinc-500" />
                        <div>
                          <div className="font-medium">{event.location}</div>
                          <div className="mt-1 text-xs text-zinc-500">{eventCity}</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Users className="mt-0.5 size-5 shrink-0 text-zinc-500" />
                        <div>
                          <div className="font-medium">
                            {availability?.label ?? `${remainingSeats} seats left`}
                          </div>
                          <div className="mt-1 text-xs text-zinc-500">
                            {soldTickets} booked of {event.capacity}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 rounded-md bg-zinc-50 p-4 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 font-medium text-zinc-950">
                        <ShieldCheck className="size-4 text-zinc-500" />
                        Mobile entry pass
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <span>Entry code issued after booking</span>
                        <span>Cancel from wallet</span>
                        <span>Scan at the gate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            </div>

            <Panel className="h-fit p-5 lg:sticky lg:top-28">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
                  Checkout
                </div>
                <h3 className="mt-2 text-2xl font-semibold">Book tickets</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Review the showtime, choose quantity, and confirm your booking.
                </p>
              </div>

              <div className="mt-5 rounded-xl theme-hero-box p-5 shadow-lg">
                <div className="text-xs font-medium uppercase tracking-[0.16em] theme-hero-muted">
                  You&apos;re booking
                </div>
                <div className="mt-2 font-semibold text-lg">{event.title}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="blue">{eventCategory}</Badge>
                  {availability?.isFillingFast && (
                    <Badge tone="amber">
                      <Flame className="mr-1 size-3.5" />
                      {availability.label}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <div className="mb-4 grid gap-2 text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-zinc-500" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-zinc-500" />
                    {event.location}, {eventCity}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">Standard admission</div>
                    <div className="mt-1 text-sm text-zinc-500">
                      Mobile entry code after booking
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatMoney(event.price)}</div>
                    <div className="mt-1 text-xs text-zinc-500">per ticket</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="text-sm font-medium">Quantity</div>
                  <div className="flex items-center gap-2" aria-label="Ticket quantity">
                    <Button
                      aria-label="Decrease ticket quantity"
                      className="size-9"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      type="button"
                      variant="outline"
                    >
                      <Minus className="size-4" />
                    </Button>
                    <div className="flex h-9 min-w-14 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold">
                      {quantity}
                    </div>
                    <Button
                      aria-label="Increase ticket quantity"
                      className="size-9"
                      disabled={quantity >= maxPurchaseQuantity}
                      onClick={() =>
                        setQuantity((current) =>
                          Math.min(maxPurchaseQuantity, current + 1),
                        )
                      }
                      type="button"
                      variant="outline"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  {maxPurchaseQuantity > 0 ? (
                    <div className="mt-2 text-xs text-zinc-500">
                      Up to {maxPurchaseQuantity} tickets per booking.
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-zinc-500">
                      No tickets available for this showtime.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-zinc-200 pt-5 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-600">Tickets</span>
                  <span className="font-medium">
                    {quantity} x {formatMoney(event.price)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-600">Convenience fee</span>
                  <span className="font-medium">Included</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-600">Ticket type</span>
                  <span className="font-medium">Standard</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-zinc-200 pt-3 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{formatMoney(total)}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-2 text-xs text-zinc-600">
                <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-2 text-emerald-800">
                  <BadgeCheck className="size-4" />
                  Confirmed bookings appear instantly in your ticket wallet.
                </div>
                <div className="flex items-center gap-2 rounded-md bg-sky-50 p-2 text-sky-800">
                  <CreditCard className="size-4" />
                  No extra convenience fee is added to this booking.
                </div>
              </div>

              {event.status !== 'PUBLISHED' && (
                <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                  This listing is not currently open for booking.
                </p>
              )}

              {event.status === 'PUBLISHED' && remainingSeats <= 0 && (
                <p className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-800">
                  This event is currently sold out.
                </p>
              )}

              <Button
                className="mt-5 w-full bg-[#ff5a3d] text-white hover:bg-[#e8492f]"
                disabled={purchaseMutation.isPending || !canBook || remainingSeats <= 0}
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push('/login');
                    return;
                  }

                  purchaseMutation.mutate();
                }}
              >
                {purchaseMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                {purchaseMutation.isPending
                  ? 'Confirming...'
                  : !isCustomer
                    ? 'Customer account required'
                    : isAuthenticated
                      ? 'Confirm booking'
                      : 'Sign in to continue'}
              </Button>
            </Panel>
          </div>
        )}
      </section>
    </EventoShell>
  );
}
