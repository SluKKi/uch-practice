export type Role = 'USER' | 'ADMIN';

export type PaymentMethod = 'IN_PERSON' | 'SBP';

export type RequestStatus = 'NEW' | 'SCHEDULED' | 'COMPLETED';

export interface User {
  id: string;
  login: string;
  fullName: string;
  phone: string;
  email: string;
  role: Role;
}

export interface RequestItem {
  id: string;
  userId: string;
  roomName: string;
  startDate: string;
  paymentMethod: PaymentMethod;
  status: RequestStatus;
  review?: string | null;
  createdAt: string;
  user?: User;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterPayload {
  login: string;
  password: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface CreateRequestPayload {
  roomName: string;
  startDate: string;
  paymentMethod: PaymentMethod;
}
