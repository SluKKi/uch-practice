import React from 'react';
import { Clock, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { RequestStatus } from '../types';

interface StatusBadgeProps {
  status: RequestStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'NEW':
      return (
        <span className="badge badge-new">
          <Clock size={14} />
          Новая
        </span>
      );
    case 'SCHEDULED':
      return (
        <span className="badge badge-scheduled">
          <CalendarCheck size={14} />
          Мероприятие назначено
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="badge badge-completed">
          <CheckCircle2 size={14} />
          Завершено
        </span>
      );
    default:
      return <span className="badge">{status}</span>;
  }
};
