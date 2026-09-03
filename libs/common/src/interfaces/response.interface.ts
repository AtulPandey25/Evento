export interface AuthResponse {
  access_token: string;
  user: UserProfileResponse;
}

export interface RegisterResponse {
  message: string;
  user: UserProfileResponse;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  city?: string;
  category?: string;
  capacity: number;
  soldTickets?: number;
  remainingCapacity?: number;
  price: number;
  status: string;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketResponse {
  id: string;
  ticketCode: string;
  eventId: string;
  userId: string;
  quantity: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}
