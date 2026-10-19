import { request } from './client';
import { CreateRequestPayload, RequestItem, RequestStatus } from '../types';

export function getRequests(): Promise<RequestItem[]> {
  return request<RequestItem[]>('/requests', {
    method: 'GET',
  });
}

export function createRequest(payload: CreateRequestPayload): Promise<RequestItem> {
  return request<RequestItem>('/requests', {
    method: 'POST',
    data: payload,
  });
}

export function updateRequestStatus(id: string, status: RequestStatus): Promise<RequestItem> {
  return request<RequestItem>(`/requests/${id}/status`, {
    method: 'PATCH',
    data: { status },
  });
}

export function submitReview(id: string, review: string): Promise<RequestItem> {
  return request<RequestItem>(`/requests/${id}/review`, {
    method: 'PATCH',
    data: { review },
  });
}
