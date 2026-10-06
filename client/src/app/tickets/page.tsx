import { EventoConsole } from '@/features/evento-console';

type TicketsPageProps = {
  searchParams?: Promise<{
    booking?: string;
    code?: string;
    event?: string;
    quantity?: string;
  }>;
};

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const params = await searchParams;
  const confirmedQuantity = Number(params?.quantity ?? 0);
  const bookingConfirmation =
    params?.booking === 'confirmed' && params.code
      ? {
          code: params.code,
          eventTitle: params.event,
          quantity:
            Number.isFinite(confirmedQuantity) && confirmedQuantity > 0
              ? confirmedQuantity
              : 1,
        }
      : undefined;

  return <EventoConsole view="tickets" bookingConfirmation={bookingConfirmation} />;
}
