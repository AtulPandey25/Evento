'use client';

import { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import {
  ArrowUpDown,
  CalendarDays,
  Clock3,
  Flame,
  Loader2,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Event } from '@/types';
import {
  Badge,
  EmptyState,
  EventPoster,
  Panel,
  EventSortOrder,
  eventCategories,
  formatEventMonth,
  formatDay,
  formatMoney,
  getEventCategory,
  getEventCity,
  getSeatAvailability,
} from './shared';

type CustomerMarketplaceProps = {
  publishedEvents: Event[];
  visibleEvents: Event[];
  isLoading: boolean;
  marketplaceCapacity: number;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  cityOptions: string[];
  selectedCity: string;
  setSelectedCity: Dispatch<SetStateAction<string>>;
  monthOptions: string[];
  selectedMonth: string;
  setSelectedMonth: Dispatch<SetStateAction<string>>;
  sortOrder: EventSortOrder;
  setSortOrder: Dispatch<SetStateAction<EventSortOrder>>;
};

export function CustomerMarketplace({
  publishedEvents,
  visibleEvents,
  isLoading,
  marketplaceCapacity,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  cityOptions,
  selectedCity,
  setSelectedCity,
  monthOptions,
  selectedMonth,
  setSelectedMonth,
  sortOrder,
  setSortOrder,
}: CustomerMarketplaceProps) {
  const hasActiveFilters =
    searchTerm.trim() ||
    selectedCategory !== 'All' ||
    selectedCity !== 'All' ||
    selectedMonth !== 'All';
  const featuredEvent = visibleEvents[0] ?? (!hasActiveFilters ? publishedEvents[0] : undefined);
  const featuredAvailability = featuredEvent ? getSeatAvailability(featuredEvent) : null;
  const featuredCategory = featuredEvent ? getEventCategory(featuredEvent, 0) : '';
  const featuredCity = featuredEvent ? getEventCity(featuredEvent) : '';

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-xl theme-hero-box">
        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_420px] md:p-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md theme-hero-badge px-3 py-1 text-xs font-medium uppercase tracking-[0.16em]">
              <Sparkles className="size-3.5" />
              Now booking
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight md:text-4xl">
              Book live shows, workshops, food nights, and founder rooms.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 theme-hero-muted">
              Pick a city, compare dates, check remaining seats, and confirm your
              ticket code from a focused event checkout.
            </p>
            <label className="mt-5 flex max-w-xl items-center gap-2 rounded-lg bg-white p-2 text-zinc-950 shadow-sm">
              <Search className="ml-2 size-4 text-zinc-500" />
              <span className="sr-only">Search events</span>
              <input
                className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500"
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by event, venue, or city"
                value={searchTerm}
              />
              <Button className="bg-[#ff5a3d] text-white hover:bg-[#e8492f]">
                Search
              </Button>
            </label>
            <div className="mt-4 flex flex-wrap gap-2">
              {['All', ...eventCategories].map((category) => (
                <button
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm transition',
                    selectedCategory === category
                      ? 'border-white bg-white font-semibold text-zinc-950 shadow-xs'
                      : 'theme-hero-subcard theme-hero-muted hover:text-white',
                  )}
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            {featuredEvent ? (
              <div className="overflow-hidden rounded-lg theme-hero-subcard p-3 shadow-inner">
                <EventPoster featured event={featuredEvent} index={0} />
                <div className="pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="blue">{featuredCategory}</Badge>
                    {featuredAvailability?.isFillingFast && (
                      <Badge tone="amber">
                        <Flame className="mr-1 size-3.5" />
                        Filling fast
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm theme-hero-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="size-4" />
                      {formatDay(featuredEvent.date).month} {formatDay(featuredEvent.date).day}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4" />
                      {featuredCity}
                    </span>
                    <span>{featuredAvailability?.label}</span>
                  </div>
                  <Button
                    asChild
                    className="mt-4 w-full bg-[#ff5a3d] text-white hover:bg-[#e8492f]"
                  >
                    <Link href={`/events/${featuredEvent.id}`}>
                      <Ticket className="size-4" />
                      Book featured event
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid content-end gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-lg theme-hero-subcard p-4">
                  <div className="text-2xl font-semibold">{publishedEvents.length}</div>
                  <div className="mt-1 text-sm theme-hero-muted">events on sale</div>
                </div>
                <div className="rounded-lg theme-hero-subcard p-4">
                  <div className="text-2xl font-semibold">{marketplaceCapacity}</div>
                  <div className="mt-1 text-sm theme-hero-muted">listed seats</div>
                </div>
                <div className="rounded-lg theme-hero-subcard p-4">
                  <div className="text-2xl font-semibold">Instant</div>
                  <div className="mt-1 text-sm theme-hero-muted">ticket codes</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Events near you</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Compare dates, venues, prices, and seat availability before checkout.
          </p>
        </div>
        <Button
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('All');
            setSelectedCity('All');
            setSelectedMonth('All');
            setSortOrder('date-asc');
          }}
          variant="outline"
        >
          <SlidersHorizontal className="size-4" />
          Reset filters
        </Button>
      </div>

      <Panel className="p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
              <MapPin className="size-3.5" />
              City
            </span>
            <select
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200"
              onChange={(event) => setSelectedCity(event.target.value)}
              value={selectedCity}
            >
              <option value="All">All cities</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
              <CalendarDays className="size-3.5" />
              Date
            </span>
            <select
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200"
              onChange={(event) => setSelectedMonth(event.target.value)}
              value={selectedMonth}
            >
              <option value="All">All dates</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {formatEventMonth(month)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
              <ArrowUpDown className="size-3.5" />
              Sort
            </span>
            <select
              className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-200"
              onChange={(event) => setSortOrder(event.target.value as EventSortOrder)}
              value={sortOrder}
            >
              <option value="date-asc">Soonest first</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>
        <div className="mt-3 text-sm text-zinc-600">
          Showing {visibleEvents.length} of {publishedEvents.length} events
        </div>
      </Panel>

      {isLoading ? (
        <Panel className="flex h-52 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-zinc-500" />
        </Panel>
      ) : publishedEvents.length === 0 ? (
        <EmptyState
          title="No events on sale"
          detail="New events will appear here when organizers publish listings."
        />
      ) : visibleEvents.length === 0 ? (
        <EmptyState
          title="No matching events"
          detail="Try a different search or clear the selected category."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event, index) => {
            const availability = getSeatAvailability(event);
            const category = getEventCategory(event, index);
            const city = getEventCity(event);

            return (
              <Panel
                key={event.id}
                className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <EventPoster event={event} index={index} />
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-14 shrink-0 rounded-md border border-zinc-200 bg-zinc-50 p-2 text-center">
                      <div className="text-xs font-semibold uppercase text-[#ff5a3d]">
                        {formatDay(event.date).month}
                      </div>
                      <div className="text-xl font-bold">{formatDay(event.date).day}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="mb-2 inline-flex rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                        {category}
                      </div>
                      <h3
                        className="line-clamp-2 font-semibold leading-snug"
                        data-testid="event-card-title"
                      >
                        {event.title}
                      </h3>
                      <div className="mt-2 flex items-center gap-1 text-sm text-zinc-600">
                        <MapPin className="size-3.5" />
                        <span className="truncate">
                          {event.location}, {city}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-600">
                    {event.description || 'Organizer details are not available.'}
                  </p>

                  <div className="mt-4 space-y-4 border-t border-zinc-200 pt-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={availability.isFillingFast ? 'amber' : 'neutral'}>
                        {availability.isFillingFast && <Flame className="mr-1 size-3.5" />}
                        {availability.label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase text-zinc-500">From</div>
                        <div className="font-semibold">{formatMoney(event.price)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs uppercase text-zinc-500">Showtime</div>
                        <div className="font-semibold">
                          {formatDay(event.date).month} {formatDay(event.date).day}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="mt-4 w-full bg-[#ff5a3d] text-white hover:bg-[#e8492f]"
                  >
                    <Link href={`/events/${event.id}`}>
                      <Ticket className="size-4" />
                      Book now
                    </Link>
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </section>
  );
}
