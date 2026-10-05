import { EventDetailCheckout } from '@/features/evento/event-detail-checkout';

type EventDetailPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;

  return <EventDetailCheckout eventId={eventId} />;
}
