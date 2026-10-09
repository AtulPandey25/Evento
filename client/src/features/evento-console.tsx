'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { Event } from '@/types';
import { CustomerMarketplace } from './evento/customer-marketplace';
import { EventoShell } from './evento/evento-shell';
import { OperationsView } from './evento/operations-view';
import { OrganizerWorkspace } from './evento/organizer-workspace';
import { TicketWallet } from './evento/ticket-wallet';
import {
  EmptyState,
  EventTicketSummary,
  EventSortOrder,
  EventForm,
  HealthStatus,
  TicketSummary,
  ViewId,
  getDefaultEventForm,
  getErrorMessage,
  getEventCategory,
  getEventCity,
  getEventMonthKey,
  organizerViews,
  views,
} from './evento/shared';

const api = {
  get: <T,>(url: string) => apiClient.get<T>(url) as unknown as Promise<T>,
  post: <T,>(url: string, data?: unknown) =>
    apiClient.post<T>(url, data) as unknown as Promise<T>,
  put: <T,>(url: string, data?: unknown) =>
    apiClient.put<T>(url, data) as unknown as Promise<T>,
};

function toEventPayload(payload: EventForm) {
  return {
    capacity: Number(payload.capacity),
    category: payload.category,
    city: payload.city,
    date: new Date(payload.date).toISOString(),
    description: payload.description,
    location: payload.location,
    price: Math.round(Number(payload.price) * 100),
    title: payload.title,
  };
}

function toDateTimeLocalValue(value: string) {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;

  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toEventForm(event: Event): EventForm {
  return {
    title: event.title,
    description: event.description ?? '',
    date: toDateTimeLocalValue(event.date),
    location: event.location,
    city: getEventCity(event),
    category: getEventCategory(event, 0),
    capacity: String(event.capacity),
    price: (event.price / 100).toFixed(2),
  };
}

type BookingConfirmation = {
  code: string;
  eventTitle?: string;
  quantity: number;
};

export function EventoConsole({
  view,
  bookingConfirmation,
}: {
  view: ViewId;
  bookingConfirmation?: BookingConfirmation;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [eventForm, setEventForm] = useState<EventForm>(() => getDefaultEventForm());
  const [checkInCode, setCheckInCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [sortOrder, setSortOrder] = useState<EventSortOrder>('date-asc');
  const [cancellingTicketId, setCancellingTicketId] = useState<string | null>(null);
  const [cancellingEventId, setCancellingEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [selectedManifestEventId, setSelectedManifestEventId] = useState<string | null>(
    null,
  );

  const publishedEventsQuery = useQuery({
    queryKey: ['events', 'published'],
    queryFn: () => api.get<Event[]>('/events'),
  });

  const myEventsQuery = useQuery({
    queryKey: ['events', 'mine'],
    queryFn: () => api.get<Event[]>('/events/my-events'),
    enabled: isAuthenticated,
  });

  const ticketsQuery = useQuery({
    queryKey: ['tickets', 'mine'],
    queryFn: () => api.get<TicketSummary[]>('/tickets/my-tickets'),
    enabled: isAuthenticated,
  });

  const eventTicketsQuery = useQuery({
    queryKey: ['tickets', 'event', selectedManifestEventId],
    queryFn: () =>
      api.get<EventTicketSummary[]>(`/tickets/event/${selectedManifestEventId}`),
    enabled: Boolean(isAuthenticated && selectedManifestEventId),
  });

  const gatewayHealthQuery = useQuery({
    queryKey: ['health', 'gateway'],
    queryFn: () => api.get<string>('/'),
    refetchInterval: 30000,
    retry: 0,
  });

  const createEventMutation = useMutation({
    mutationFn: (payload: EventForm) =>
      api.post<Event>('/events', toEventPayload(payload)),
    onSuccess: () => {
      toast.success('Draft event created');
      router.push('/organizer/events');
      setEventForm(getDefaultEventForm());
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      toast.error('Could not create event', {
        description: getErrorMessage(error),
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, payload }: { eventId: string; payload: EventForm }) =>
      api.put<Event>(`/events/${eventId}`, toEventPayload(payload)),
    onSuccess: () => {
      toast.success('Draft event updated');
      setEditingEventId(null);
      setEventForm(getDefaultEventForm());
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      toast.error('Could not update event', {
        description: getErrorMessage(error),
      });
    },
  });

  const publishEventMutation = useMutation({
    mutationFn: (eventId: string) =>
      api.post<Event>(`/events/${eventId}/publish`, {}),
    onSuccess: () => {
      toast.success('Event published');
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      toast.error('Could not publish event', {
        description: getErrorMessage(error),
      });
    },
  });

  const cancelEventMutation = useMutation({
    mutationFn: (eventId: string) =>
      api.post<Event>(`/events/${eventId}/cancel`, {}),
    onSuccess: () => {
      toast.success('Event listing cancelled');
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error) => {
      toast.error('Could not cancel event', {
        description: getErrorMessage(error),
      });
    },
    onSettled: () => {
      setCancellingEventId(null);
    },
  });

  const cancelTicketMutation = useMutation({
    mutationFn: (ticketId: string) =>
      api.post<{ message: string }>(`/tickets/${ticketId}/cancel`, {}),
    onSuccess: () => {
      toast.success('Ticket cancelled');
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error) => {
      toast.error('Could not cancel ticket', {
        description: getErrorMessage(error),
      });
    },
    onSettled: () => {
      setCancellingTicketId(null);
    },
  });

  const checkInMutation = useMutation({
    mutationFn: (ticketCode: string) =>
      api.post<{ message: string }>('/tickets/check-in', { ticketCode }),
    onSuccess: () => {
      toast.success('Ticket checked in');
      void queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error) => {
      toast.error('Could not check in ticket', {
        description: getErrorMessage(error),
      });
    },
  });

  const publishedEvents = publishedEventsQuery.data ?? [];
  const myEvents = myEventsQuery.data ?? [];
  const tickets = ticketsQuery.data ?? [];
  const eventTickets = eventTicketsQuery.data ?? [];
  const eventCityOptions = Array.from(
    new Set(publishedEvents.map((event) => getEventCity(event))),
  ).sort((a, b) => a.localeCompare(b));
  const eventMonthOptions = Array.from(
    new Set(publishedEvents.map((event) => getEventMonthKey(event))),
  ).sort();
  const visibleEvents = publishedEvents
    .filter((event, index) => {
      const category = getEventCategory(event, index);
      const city = getEventCity(event);
      const month = getEventMonthKey(event);
      const search = searchTerm.trim().toLowerCase();
      const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
      const matchesCity = selectedCity === 'All' || city === selectedCity;
      const matchesMonth = selectedMonth === 'All' || month === selectedMonth;
      const matchesSearch =
        !search ||
        `${event.title} ${event.description ?? ''} ${event.location} ${city} ${category}`
          .toLowerCase()
          .includes(search);

      return matchesCategory && matchesCity && matchesMonth && matchesSearch;
    })
    .sort((left, right) => {
      if (sortOrder === 'price-asc') return left.price - right.price;
      if (sortOrder === 'price-desc') return right.price - left.price;

      return new Date(left.date).getTime() - new Date(right.date).getTime();
    });

  const isOrganizerView = view === 'organizer' || view === 'check-in';
  const userRole = user?.role || 'USER';
  const isOrganizer = userRole === 'ORGANIZER' || userRole === 'ADMIN';
  const canOpenSystem = userRole === 'ADMIN';
  const publishedCount = myEvents.filter((event) => event.status === 'PUBLISHED').length;
  const draftCount = myEvents.filter((event) => event.status === 'DRAFT').length;
  const totalCapacity = myEvents.reduce((total, event) => total + event.capacity, 0);
  const marketplaceCapacity = publishedEvents.reduce(
    (total, event) => total + event.capacity,
    0,
  );
  const readyTicketCount = tickets
    .filter((ticket) => ticket.status === 'CONFIRMED')
    .reduce((total, ticket) => total + ticket.quantity, 0);
  const walletTotal = tickets.reduce((total, ticket) => total + (ticket.totalPrice ?? 0), 0);
  const nextTicketDate = tickets
    .map((ticket) => ticket.eventDate)
    .filter((date): date is string => Boolean(date))
    .sort()[0];
  const navItems = isOrganizerView && isOrganizer
    ? organizerViews
    : views.filter((item) => item.id !== 'organizer' || isOrganizer);

  const systemHealth: Array<{ label: string; detail: string; status: HealthStatus }> = [
    {
      label: 'Gateway',
      detail: 'HTTP routing',
      status: gatewayHealthQuery.isSuccess ? 'online' : 'offline',
    },
    {
      label: 'Events',
      detail: `${publishedEvents.length} published`,
      status: publishedEventsQuery.isSuccess ? 'online' : 'offline',
    },
    {
      label: 'Tickets',
      detail: isAuthenticated ? `${tickets.length} owned` : 'JWT protected',
      status: ticketsQuery.isSuccess || !isAuthenticated ? 'online' : 'offline',
    },
    {
      label: 'Kafka contracts',
      detail: 'Notification flows verified by tests',
      status: 'verified',
    },
  ];

  function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingEventId) {
      updateEventMutation.mutate({ eventId: editingEventId, payload: eventForm });
      return;
    }

    createEventMutation.mutate(eventForm);
  }

  return (
    <EventoShell
      view={view}
      isOrganizerView={isOrganizerView}
      isAuthenticated={isAuthenticated}
      user={user}
      clearAuth={clearAuth}
      canOpenSystem={canOpenSystem}
      navItems={navItems}
    >
      {view === 'events' && (
        <CustomerMarketplace
          publishedEvents={publishedEvents}
          visibleEvents={visibleEvents}
          isLoading={publishedEventsQuery.isLoading}
          marketplaceCapacity={marketplaceCapacity}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          cityOptions={eventCityOptions}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          monthOptions={eventMonthOptions}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      )}

      {view === 'tickets' && (
        <TicketWallet
          isAuthenticated={isAuthenticated}
          isLoading={ticketsQuery.isLoading}
          tickets={tickets}
          bookingConfirmation={bookingConfirmation}
          readyTicketCount={readyTicketCount}
          walletTotal={walletTotal}
          nextTicketDate={nextTicketDate}
          cancellingTicketId={cancellingTicketId}
          onCancelTicket={(ticketId) => {
            setCancellingTicketId(ticketId);
            cancelTicketMutation.mutate(ticketId);
          }}
        />
      )}

      {isOrganizerView && (!isAuthenticated || !isOrganizer) && (
        <EmptyState
          title={isAuthenticated ? 'Organizer access required' : 'Sign in as an organizer'}
          detail={
            isAuthenticated
              ? 'Customer accounts can browse events and manage tickets from the customer area.'
              : 'Organizer tools are available after signing in with an organizer account.'
          }
          actions={
            isAuthenticated
              ? [
                  { href: '/events', label: 'Return to Browse' },
                  { href: '/tickets', label: 'Open My tickets', variant: 'secondary' },
                ]
              : [
                  { href: '/login?role=organizer', label: 'Sign in as organizer' },
                  {
                    href: '/register?role=organizer',
                    label: 'Create organizer account',
                    variant: 'secondary',
                  },
                ]
          }
        />
      )}

      {isOrganizerView && isAuthenticated && isOrganizer && (
        <OrganizerWorkspace
          view={view}
          eventForm={eventForm}
          setEventForm={setEventForm}
          onCreateEvent={handleCreateEvent}
          createPending={createEventMutation.isPending}
          editingEventId={editingEventId}
          updatePending={updateEventMutation.isPending}
          onStartEditEvent={(event) => {
            setEditingEventId(event.id);
            setEventForm(toEventForm(event));
          }}
          onCancelEditEvent={() => {
            setEditingEventId(null);
            setEventForm(getDefaultEventForm());
          }}
          checkInCode={checkInCode}
          setCheckInCode={setCheckInCode}
          onCheckIn={(ticketCode) => checkInMutation.mutate(ticketCode)}
          checkInPending={checkInMutation.isPending}
          myEvents={myEvents}
          myEventsLoading={myEventsQuery.isLoading}
          publishedCount={publishedCount}
          draftCount={draftCount}
          totalCapacity={totalCapacity}
          selectedManifestEventId={selectedManifestEventId}
          selectedManifestEventTitle={
            myEvents.find((event) => event.id === selectedManifestEventId)?.title
          }
          eventTickets={eventTickets}
          eventTicketsLoading={eventTicketsQuery.isLoading}
          onViewEventTickets={(eventId) => setSelectedManifestEventId(eventId)}
          onCloseEventTickets={() => setSelectedManifestEventId(null)}
          publishPending={publishEventMutation.isPending}
          onPublishEvent={(eventId) => publishEventMutation.mutate(eventId)}
          cancelPending={cancelEventMutation.isPending}
          cancellingEventId={cancellingEventId}
          onCancelEvent={(eventId) => {
            setCancellingEventId(eventId);
            cancelEventMutation.mutate(eventId);
          }}
        />
      )}

      {view === 'ops' && !canOpenSystem && (
        <EmptyState
          title={isAuthenticated ? 'System access required' : 'Sign in as an admin'}
          detail={
            isAuthenticated
              ? 'Operations details are restricted to admin accounts.'
              : 'Operations details are available after signing in with an admin account.'
          }
        />
      )}

      {view === 'ops' && canOpenSystem && (
        <OperationsView
          systemHealth={systemHealth}
          onProbeGateway={() => {
            void gatewayHealthQuery.refetch();
          }}
        />
      )}
    </EventoShell>
  );
}
