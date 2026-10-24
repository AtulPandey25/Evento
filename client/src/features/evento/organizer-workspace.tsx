'use client';

import { Dispatch, FormEvent, SetStateAction, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Ban,
  CalendarDays,
  CheckCircle2,
  ListChecks,
  Loader2,
  Pencil,
  Plus,
  ReceiptText,
  ShieldCheck,
  X,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Event } from '@/types';
import {
  Badge,
  EmptyState,
  EventForm,
  EventPoster,
  EventTicketSummary,
  Panel,
  ViewId,
  eventCategories,
  formatDate,
  formatMoney,
  formatTicketStatus,
  getEventCategory,
  getEventCity,
  pluralizeTickets,
  statusTone,
} from './shared';

type OrganizerWorkspaceProps = {
  view: ViewId;
  eventForm: EventForm;
  setEventForm: Dispatch<SetStateAction<EventForm>>;
  onCreateEvent: (event: FormEvent<HTMLFormElement>) => void;
  createPending: boolean;
  editingEventId: string | null;
  updatePending: boolean;
  onStartEditEvent: (event: Event) => void;
  onCancelEditEvent: () => void;
  checkInCode: string;
  setCheckInCode: Dispatch<SetStateAction<string>>;
  onCheckIn: (ticketCode: string) => void;
  checkInPending: boolean;
  myEvents: Event[];
  myEventsLoading: boolean;
  publishedCount: number;
  draftCount: number;
  totalCapacity: number;
  selectedManifestEventId: string | null;
  selectedManifestEventTitle?: string;
  eventTickets: EventTicketSummary[];
  eventTicketsLoading: boolean;
  onViewEventTickets: (eventId: string) => void;
  onCloseEventTickets: () => void;
  publishPending: boolean;
  onPublishEvent: (eventId: string) => void;
  cancelPending: boolean;
  cancellingEventId: string | null;
  onCancelEvent: (eventId: string) => void;
};

export function OrganizerWorkspace({
  view,
  eventForm,
  setEventForm,
  onCreateEvent,
  createPending,
  editingEventId,
  updatePending,
  onStartEditEvent,
  onCancelEditEvent,
  checkInCode,
  setCheckInCode,
  onCheckIn,
  checkInPending,
  myEvents,
  myEventsLoading,
  publishedCount,
  draftCount,
  totalCapacity,
  selectedManifestEventId,
  selectedManifestEventTitle,
  eventTickets,
  eventTicketsLoading,
  onViewEventTickets,
  onCloseEventTickets,
  publishPending,
  onPublishEvent,
  cancelPending,
  cancellingEventId,
  onCancelEvent,
}: OrganizerWorkspaceProps) {
  const [confirmingEventId, setConfirmingEventId] = useState<string | null>(null);
  const isEditing = Boolean(editingEventId);
  const formPending = createPending || updatePending;
  const readinessItems = [
    eventForm.title.trim(),
    eventForm.description.trim(),
    eventForm.date,
    eventForm.location.trim(),
    eventForm.city.trim(),
    eventForm.category,
    eventForm.capacity,
    eventForm.price,
  ];
  const readyFieldCount = readinessItems.filter(Boolean).length;
  const previewPrice =
    eventForm.price === ''
      ? 'Set price'
      : formatMoney(Math.round(Number(eventForm.price || 0) * 100));
  const previewCapacity = eventForm.capacity ? `${eventForm.capacity} seats` : 'Set seats';
  const previewVenue =
    eventForm.location || eventForm.city
      ? [eventForm.location, eventForm.city].filter(Boolean).join(', ')
      : 'Add venue and city';
  const manifestTicketCount = eventTickets.reduce(
    (total, ticket) => total + ticket.quantity,
    0,
  );
  const manifestRevenue = eventTickets.reduce(
    (total, ticket) => total + (ticket.totalPrice ?? 0),
    0,
  );

  return (
    <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
      <div className="space-y-5">
        {view === 'organizer' && (
          <Panel className="h-fit p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {isEditing ? 'Edit listing' : 'Create listing'}
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  {isEditing
                    ? 'Update the draft, then publish it for sale.'
                    : 'Draft the event, then publish it for sale.'}
                </p>
              </div>
              {isEditing ? (
                <Pencil className="size-5 text-zinc-500" />
              ) : (
                <Plus className="size-5 text-zinc-500" />
              )}
            </div>

            <form className="mt-5 space-y-4" onSubmit={onCreateEvent}>
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase text-zinc-500">
                  Event name
                </span>
                <Input
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                  value={eventForm.title}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase text-zinc-500">
                  Description
                </span>
                <textarea
                  className="min-h-24 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200"
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  required
                  value={eventForm.description}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase text-zinc-500">
                    Date
                  </span>
                  <Input
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    required
                    type="datetime-local"
                    value={eventForm.date}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase text-zinc-500">
                    Venue
                  </span>
                  <Input
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    required
                    value={eventForm.location}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase text-zinc-500">
                    City
                  </span>
                  <Input
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                    required
                    value={eventForm.city}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase text-zinc-500">
                    Category
                  </span>
                  <select
                    className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm shadow-xs outline-none transition focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200"
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    required
                    value={eventForm.category}
                  >
                    {eventCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase text-zinc-500">
                    Seats
                  </span>
                  <Input
                    min={1}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        capacity: event.target.value,
                      }))
                    }
                    required
                    type="number"
                    value={eventForm.capacity}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase text-zinc-500">
                    Price
                  </span>
                  <Input
                    inputMode="decimal"
                    min={0}
                    onChange={(event) =>
                      setEventForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    placeholder="25.00"
                    required
                    step="0.01"
                    type="number"
                    value={eventForm.price}
                  />
                  <span className="mt-1 block text-xs text-zinc-500">
                    Enter the ticket price in INR. Use 0 for free events.
                  </span>
                </label>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="flex-1" disabled={formPending} type="submit">
                  {formPending && <Loader2 className="size-4 animate-spin" />}
                  {isEditing ? 'Save changes' : 'Create draft'}
                </Button>
                {isEditing && (
                  <Button
                    className="sm:w-32"
                    disabled={formPending}
                    onClick={onCancelEditEvent}
                    type="button"
                    variant="outline"
                  >
                    <X className="size-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>

            <section
              aria-label="Listing preview"
              className="mt-5 border-t border-zinc-200 pt-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Listing preview</h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    This is how the event will read before publishing.
                  </p>
                </div>
                <Badge tone={readyFieldCount === readinessItems.length ? 'green' : 'amber'}>
                  {readyFieldCount}/{readinessItems.length} ready
                </Badge>
              </div>
              <div className="mt-4 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="blue">{eventForm.category}</Badge>
                  <span className="text-sm font-medium text-zinc-700">{previewPrice}</span>
                </div>
                <div className="mt-3 text-lg font-semibold">
                  {eventForm.title || 'Untitled listing'}
                </div>
                <div className="mt-3 grid gap-2 text-sm text-zinc-600">
                  <span>{eventForm.date ? formatDate(eventForm.date) : 'Choose date'}</span>
                  <span>{previewVenue}</span>
                  <span>{previewCapacity}</span>
                </div>
              </div>
            </section>
          </Panel>
        )}

        {view === 'check-in' && (
          <Panel className="h-fit p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Door check-in</h2>
                <p className="mt-1 text-sm text-zinc-600">Validate a ticket code.</p>
              </div>
              <ShieldCheck className="size-5 text-zinc-500" />
            </div>

            <form
              className="mt-5 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                onCheckIn(checkInCode);
              }}
            >
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase text-zinc-500">
                  Ticket code
                </span>
                <Input
                  onChange={(event) => setCheckInCode(event.target.value)}
                  placeholder="EVT-9K2M"
                  value={checkInCode}
                />
              </label>
              <Button className="w-full" disabled={!checkInCode || checkInPending} type="submit">
                {checkInPending && <Loader2 className="size-4 animate-spin" />}
                <CheckCircle2 className="size-4" />
                Check in
              </Button>
            </form>
          </Panel>
        )}
      </div>

      <div className="space-y-4">
        <div className="rounded-xl theme-hero-box p-6 shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.16em] theme-hero-muted">
                Organizer workspace
              </div>
              <h2 className="mt-2 text-2xl font-semibold">Listings and sales readiness</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 theme-hero-muted">
                Create listings, publish ready events, and keep the entry desk in sync.
              </p>
            </div>
            <Button asChild className="bg-[#ff5a3d] text-white hover:bg-[#e8492f]">
              <Link href={view === 'organizer' ? '/organizer/check-in' : '/organizer/events'}>
                {view === 'organizer' ? (
                  <ShieldCheck className="size-4" />
                ) : (
                  <CalendarDays className="size-4" />
                )}
                {view === 'organizer' ? 'Open check-in' : 'Manage listings'}
              </Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg theme-hero-subcard p-4">
              <div className="text-2xl font-semibold">{publishedCount}</div>
              <div className="mt-1 text-sm theme-hero-muted">published</div>
            </div>
            <div className="rounded-lg theme-hero-subcard p-4">
              <div className="text-2xl font-semibold">{draftCount}</div>
              <div className="mt-1 text-sm theme-hero-muted">drafts</div>
            </div>
            <div className="rounded-lg theme-hero-subcard p-4">
              <div className="flex items-center gap-2 text-2xl font-semibold">
                <Users className="size-5 text-zinc-300" />
                {totalCapacity}
              </div>
              <div className="mt-1 text-sm theme-hero-muted">total seats</div>
            </div>
          </div>
        </div>

        {myEventsLoading ? (
          <Panel className="flex h-52 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-zinc-500" />
          </Panel>
        ) : myEvents.length === 0 ? (
          <EmptyState
            title="No listings yet"
            detail="Create a draft to see the organizer publishing flow."
          />
        ) : (
          <div className="space-y-4">
            {selectedManifestEventId && (
              <Panel className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
                      <ReceiptText className="size-4" />
                      Booking manifest
                    </div>
                    <h3 className="mt-2 text-xl font-semibold">
                      {selectedManifestEventTitle ?? 'Selected event'}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600">
                      Customer bookings and entry codes for this listing.
                    </p>
                  </div>
                  <Button onClick={onCloseEventTickets} type="button" variant="outline">
                    <X className="size-4" />
                    Close
                  </Button>
                </div>

                {eventTicketsLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-zinc-500" />
                  </div>
                ) : eventTickets.length === 0 ? (
                  <div className="mt-4 rounded-md border border-dashed border-zinc-200 p-5 text-sm text-zinc-600">
                    No bookings yet. Customer bookings will appear here after tickets are sold.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                        <div className="text-2xl font-semibold">{eventTickets.length}</div>
                        <div className="mt-1 text-sm text-zinc-600">bookings</div>
                      </div>
                      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                        <div className="text-2xl font-semibold">{manifestTicketCount}</div>
                        <div className="mt-1 text-sm text-zinc-600">tickets sold</div>
                      </div>
                      <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                        <div className="text-2xl font-semibold">
                          {formatMoney(manifestRevenue)}
                        </div>
                        <div className="mt-1 text-sm text-zinc-600">gross sales</div>
                      </div>
                    </div>

                    <div className="divide-y divide-zinc-200 rounded-md border border-zinc-200">
                      {eventTickets.map((ticket) => (
                        <div
                          className="grid gap-3 p-3 md:grid-cols-[1fr_auto] md:items-center"
                          key={ticket.id}
                        >
                          <div className="min-w-0">
                            <div className="mb-2">
                              <div className="font-medium">
                                {ticket.userName || 'Customer'}
                              </div>
                              <div className="text-sm text-zinc-500">
                                {ticket.userEmail || ticket.userId || 'Attendee details unavailable'}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge tone={statusTone(ticket.status)}>
                                {formatTicketStatus(ticket.status)}
                              </Badge>
                              <span className="font-mono text-sm text-zinc-600">
                                {ticket.ticketCode}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-zinc-600">
                              <span>{pluralizeTickets(ticket.quantity)}</span>
                              <span>{formatMoney(ticket.totalPrice)}</span>
                              {ticket.purchasedAt && (
                                <span>Purchased {formatDate(ticket.purchasedAt)}</span>
                              )}
                            </div>
                          </div>
                          {ticket.checkedInAt && (
                            <div className="text-sm text-zinc-500">
                              Checked in {formatDate(ticket.checkedInAt)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Panel>
            )}

            <Panel className="overflow-hidden">
              <div className="divide-y divide-zinc-200">
              {myEvents.map((event, index) => {
                const isCancelling = cancellingEventId === event.id;
                const isConfirmingCancellation = confirmingEventId === event.id;
                const canCancel = event.status !== 'CANCELLED';
                const canEdit = event.status === 'DRAFT';
                const category = getEventCategory(event, index);
                const city = getEventCity(event);
                const soldTickets = event.soldTickets ?? 0;
                const remainingSeats = event.remainingCapacity ?? event.capacity;

                return (
                  <div
                    key={event.id}
                    className="grid gap-4 p-4 md:grid-cols-[120px_1fr_auto] md:items-center"
                  >
                    <EventPoster compact event={event} index={index} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={statusTone(event.status)}>{event.status}</Badge>
                        <Badge tone="blue">{category}</Badge>
                        <span className="text-sm text-zinc-500">{formatMoney(event.price)}</span>
                      </div>
                      <h3 className="mt-2 font-semibold">{event.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600">
                        <span>{formatDate(event.date)}</span>
                        <span>
                          {event.location}, {city}
                        </span>
                        <span>{event.capacity} seats</span>
                        <span>{soldTickets} sold</span>
                        <span>{remainingSeats} remaining</span>
                      </div>
                      {event.status === 'CANCELLED' && (
                        <p className="mt-2 text-sm text-zinc-500">
                          This listing is closed and no longer appears in Browse.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Button
                        disabled={event.status !== 'DRAFT' || publishPending}
                        onClick={() => onPublishEvent(event.id)}
                      >
                        {publishPending && <Loader2 className="size-4 animate-spin" />}
                        Publish
                      </Button>
                      <Button
                        disabled={!canEdit || formPending}
                        onClick={() => onStartEditEvent(event)}
                        variant="outline"
                      >
                        <Pencil className="size-4" />
                        Edit draft
                      </Button>
                      <Button
                        disabled={event.status === 'DRAFT'}
                        onClick={() => onViewEventTickets(event.id)}
                        variant="outline"
                      >
                        <ListChecks className="size-4" />
                        View bookings
                      </Button>
                      <Button
                        aria-label={`Cancel listing ${event.title}`}
                        disabled={!canCancel || cancelPending}
                        onClick={() => setConfirmingEventId(event.id)}
                        variant="outline"
                      >
                        {isCancelling ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Ban className="size-4" />
                        )}
                        {isCancelling ? 'Cancelling...' : 'Cancel listing'}
                      </Button>
                      {isConfirmingCancellation && (
                        <div className="w-full rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-950 md:max-w-xs">
                          <div className="flex gap-2">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            <div>
                              <div className="font-semibold">Cancel this listing?</div>
                              <p className="mt-1 text-rose-800">
                                Existing customer tickets will be cancelled.
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              onClick={() => setConfirmingEventId(null)}
                              type="button"
                              variant="outline"
                            >
                              Keep listing
                            </Button>
                            <Button
                              aria-label={`Confirm cancellation for ${event.title}`}
                              className="bg-rose-600 text-white hover:bg-rose-700"
                              disabled={isCancelling}
                              onClick={() => {
                                setConfirmingEventId(null);
                                onCancelEvent(event.id);
                              }}
                              type="button"
                            >
                              Confirm cancellation
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </section>
  );
}
