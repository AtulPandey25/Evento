'use client';

import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Activity,
  CalendarDays,
  Loader2,
  Mail,
  Network,
  Plus,
  Search,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import QRCode from 'qrcode';
import { cn } from '@/lib/utils';
import type { Event } from '@/types';

export type ViewId = 'events' | 'tickets' | 'organizer' | 'check-in' | 'ops';

export type EventForm = {
  title: string;
  description: string;
  date: string;
  location: string;
  city: string;
  category: string;
  capacity: string;
  price: string;
};

export type TicketSummary = {
  id: string;
  ticketCode: string;
  quantity: number;
  totalPrice?: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN';
  purchasedAt?: string;
  checkedInAt?: string | null;
  eventId: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
};

export type EventTicketSummary = {
  id: string;
  ticketCode: string;
  quantity: number;
  totalPrice?: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN';
  purchasedAt?: string;
  checkedInAt?: string | null;
  userId?: string;
  userName?: string;
  userEmail?: string;
};

export type PurchaseResponse = {
  message: string;
  ticket: {
    id: string;
    ticketCode: string;
    eventTitle: string;
    quantity: number;
    totalPrice: number;
    status: string;
    purchasedAt: string;
  };
};

export type HealthStatus = 'online' | 'offline' | 'verified';

export type EventSortOrder = 'date-asc' | 'price-asc' | 'price-desc';

export const views: Array<{ id: ViewId; label: string; href: string; icon: typeof Search }> = [
  { id: 'events', label: 'Browse', href: '/events', icon: Search },
  { id: 'tickets', label: 'My tickets', href: '/tickets', icon: Ticket },
  { id: 'organizer', label: 'Organizer', href: '/organizer/events', icon: Plus },
];

export const organizerViews: Array<{
  id: ViewId;
  label: string;
  href: string;
  icon: typeof Search;
}> = [
  { id: 'organizer', label: 'Events', href: '/organizer/events', icon: CalendarDays },
  { id: 'check-in', label: 'Check-in', href: '/organizer/check-in', icon: ShieldCheck },
];

export const runtimeSurfaces = [
  {
    name: 'API Gateway',
    detail: 'Public HTTP entry point for the app',
    signal: 'HTTP routes',
    icon: Network,
  },
  {
    name: 'Kafka events',
    detail: 'Domain events emitted by auth, events, and tickets services',
    signal: 'Async flow',
    icon: Activity,
  },
  {
    name: 'Notifications',
    detail: 'Email workflows consume Kafka event payloads',
    signal: 'Email contract',
    icon: Mail,
  },
];

export const dataModel = [
  { name: 'users', owner: 'auth-service', detail: 'Accounts and roles' },
  { name: 'events', owner: 'events-service', detail: 'Listings and publishing' },
  { name: 'tickets', owner: 'tickets-service', detail: 'Ticket bookings and entry codes' },
];

export const eventTopics = [
  'user.registered',
  'user.login',
  'event.created',
  'event.published',
  'event.updated',
  'event.cancelled',
  'ticket.purchased',
  'ticket.cancelled',
  'ticket.checked-in',
];

export const eventCategories = ['Live shows', 'Workshops', 'Food festivals', 'Startup meetups'];

const posterStyles = [
  {
    bg: 'bg-[#121212]',
    accent: 'bg-[#ff5a3d]',
    text: 'text-[#f7f1e8]',
    label: 'LIVE',
    image:
      'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    bg: 'bg-[#1e3a34]',
    accent: 'bg-[#f0c75e]',
    text: 'text-[#f7f1e8]',
    label: 'NIGHT',
    image:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
  },
  {
    bg: 'bg-[#24324a]',
    accent: 'bg-[#7dd3fc]',
    text: 'text-white',
    label: 'STAGE',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    bg: 'bg-[#4a1f2a]',
    accent: 'bg-[#fb7185]',
    text: 'text-white',
    label: 'PASS',
    image:
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
  },
];

export function getDefaultEventForm(): EventForm {
  return {
    title: '',
    description: '',
    date: '',
    location: '',
    city: '',
    category: eventCategories[0],
    capacity: '',
    price: '',
  };
}

export function formatDate(value?: string) {
  if (!value) return 'No date';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDay(value?: string) {
  if (!value) return { month: '--', day: '--' };

  const date = new Date(value);
  return {
    month: new Intl.DateTimeFormat('en', { month: 'short' }).format(date),
    day: new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date),
  };
}

export function formatMoney(cents?: number) {
  if (!cents) return 'Free';

  return new Intl.NumberFormat('en-IN', {
    currency: 'INR',
    currencyDisplay: 'code',
    style: 'currency',
  }).format(cents / 100);
}

export function formatTicketStatus(status: TicketSummary['status']) {
  if (status === 'CONFIRMED') return 'Ready for entry';
  if (status === 'CHECKED_IN') return 'Checked in';
  if (status === 'CANCELLED') return 'Cancelled';
  return 'Pending';
}

export function pluralizeTickets(quantity: number) {
  return quantity === 1 ? '1 ticket' : `${quantity} tickets`;
}

export function getEventCategory(event: Event, index: number) {
  if (event.category?.trim()) return event.category.trim();

  const text = `${event.title} ${event.description ?? ''}`.toLowerCase();

  if (text.includes('workshop') || text.includes('design')) return 'Workshops';
  if (text.includes('food') || text.includes('market')) return 'Food festivals';
  if (text.includes('startup') || text.includes('founder')) return 'Startup meetups';

  return eventCategories[index % eventCategories.length];
}

export function getEventCity(event: Event) {
  if (event.city?.trim()) return event.city.trim();

  const location = event.location.trim();
  const knownCities = [
    'Mumbai',
    'Bengaluru',
    'Delhi',
    'Pune',
    'Hyderabad',
    'Chennai',
    'Kolkata',
    'Ahmedabad',
    'Jaipur',
    'Goa',
  ];
  const matchedCity = knownCities.find((city) =>
    location.toLowerCase().includes(city.toLowerCase()),
  );

  if (matchedCity) return matchedCity;

  return location.split(',')[0]?.trim() || 'Other cities';
}

export function getEventMonthKey(event: Event) {
  const date = new Date(event.date);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');

  return `${year}-${month}`;
}

export function getSeatAvailability(event: Event) {
  const remainingSeats = event.remainingCapacity ?? event.capacity;
  const soldTickets = event.soldTickets ?? 0;
  const soldRatio = event.capacity > 0 ? soldTickets / event.capacity : 0;
  const isSoldOut = remainingSeats <= 0;
  const isFillingFast = !isSoldOut && (remainingSeats <= 10 || soldRatio >= 0.75);

  return {
    remainingSeats,
    soldTickets,
    isSoldOut,
    isFillingFast,
    label: isSoldOut
      ? 'Sold out'
      : isFillingFast
        ? `${remainingSeats} seats left`
        : `${remainingSeats} seats available`,
  };
}

export function formatEventMonth(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);

  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1));
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'We could not complete that action.';
}

export function statusTone(status?: string) {
  if (status === 'PUBLISHED' || status === 'CONFIRMED' || status === 'CHECKED_IN') {
    return 'green' as const;
  }

  if (status === 'CANCELLED') return 'red' as const;

  return 'amber' as const;
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue';
}) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium',
        tone === 'neutral' && 'border-zinc-200 bg-white text-zinc-700',
        tone === 'green' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
        tone === 'amber' && 'border-amber-200 bg-amber-50 text-amber-800',
        tone === 'red' && 'border-rose-200 bg-rose-50 text-rose-800',
        tone === 'blue' && 'border-sky-200 bg-sky-50 text-sky-800',
      )}
    >
      {children}
    </span>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-md border border-zinc-200 bg-white shadow-xs', className)}>
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  detail,
  actions,
}: {
  title: string;
  detail: string;
  actions?: Array<{
    href: string;
    label: string;
    variant?: 'primary' | 'secondary';
  }>;
}) {
  return (
    <Panel className="border-dashed p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-zinc-100 text-zinc-500">
        <Ticket className="size-5" />
      </div>
      <div className="mt-4 text-base font-semibold text-zinc-950">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">{detail}</p>
      {actions?.length ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {actions.map((action) => (
            <Link
              key={`${action.href}-${action.label}`}
              className={cn(
                'inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium transition',
                action.variant === 'secondary'
                  ? 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950'
                  : 'bg-[#ff5a3d] text-white hover:bg-[#e8492f]',
              )}
              href={action.href}
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}

export function EventPoster({
  event,
  index,
  compact = false,
  featured = false,
}: {
  event: Event;
  index: number;
  compact?: boolean;
  featured?: boolean;
}) {
  const stableIndex =
    event.id
      .split('')
      .reduce((total, character) => total + character.charCodeAt(0), index) %
    posterStyles.length;
  const style = posterStyles[stableIndex];
  const day = formatDay(event.date);

  return (
    <div
      className={cn(
        'relative overflow-hidden p-4',
        compact ? 'h-28 rounded-md' : featured ? 'h-72 rounded-md' : 'h-56 rounded-t-md',
        style.bg,
        style.text,
      )}
    >
      <Image
        alt={`${event.title} event poster`}
        className="absolute inset-0 size-full object-cover"
        fill
        priority={featured}
        sizes={featured ? '(min-width: 1024px) 420px, 100vw' : '(min-width: 768px) 33vw, 100vw'}
        src={style.image}
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
      <div className={cn('absolute left-0 top-0 h-full w-2', style.accent)} />
      <div className="relative flex h-full flex-col justify-between pl-2">
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-md bg-black/40 px-2 py-1 font-mono text-xs font-semibold tracking-[0.18em] text-white">
            {style.label}
          </div>
          <div
            className={cn(
              'rounded-md bg-white text-center text-zinc-950',
              compact ? 'px-2 py-1' : 'px-3 py-2',
            )}
          >
            <div className="text-xs font-semibold uppercase">{day.month}</div>
            <div className={cn('font-bold leading-none', compact ? 'text-lg' : 'text-2xl')}>
              {day.day}
            </div>
          </div>
        </div>
        <div>
          <div className={cn('mb-2 h-px bg-white/45', compact ? 'w-12' : 'w-20')} />
          <div
            className={cn(
              'line-clamp-2 max-w-[14rem] font-semibold leading-tight',
              compact ? 'text-sm' : featured ? 'text-3xl' : 'text-2xl',
            )}
          >
            {event.title}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TicketQrCode({ value }: { value: string }) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(value, {
      margin: 1,
      width: 148,
      color: {
        dark: '#18181b',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div className="flex size-40 items-center justify-center rounded-md bg-white p-2">
      {qrDataUrl ? (
        <Image
          alt={`QR code for ${value}`}
          className="size-full object-contain"
          height={148}
          unoptimized
          src={qrDataUrl}
          width={148}
        />
      ) : (
        <Loader2 className="size-5 animate-spin text-zinc-500" />
      )}
    </div>
  );
}
