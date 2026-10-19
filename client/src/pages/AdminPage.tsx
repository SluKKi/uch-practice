import React, { useEffect, useState } from 'react';
import { ShieldCheck, Search, Filter, AlertCircle, CheckCircle, RefreshCw, User, Phone, Mail } from 'lucide-react';
import { RequestItem, RequestStatus } from '../types';
import { getRequests, updateRequestStatus } from '../api/requests';
import { StatusBadge } from '../components/StatusBadge';
import { ApiError } from '../api/client';

export const AdminPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchAllRequests = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getRequests();
      setRequests(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Не удалось загрузить заявки пользователей');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const handleStatusChange = async (id: string, newStatus: RequestStatus) => {
    setUpdatingId(id);
    setError('');
    setSuccessMessage('');

    try {
      const updated = await updateRequestStatus(id, newStatus);
      setRequests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: updated.status } : item))
      );
      setSuccessMessage(`Статус заявки #${id.slice(0, 8)} успешно обновлен`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Ошибка при изменении статуса заявки');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatPaymentMethod = (method: string): string => {
    return method === 'IN_PERSON' ? 'Очно' : 'СБП';
  };

  const filteredRequests = requests.filter((req) => {
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      req.roomName.toLowerCase().includes(query) ||
      (req.user?.fullName && req.user.fullName.toLowerCase().includes(query)) ||
      (req.user?.login && req.user.login.toLowerCase().includes(query)) ||
      (req.user?.phone && req.user.phone.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={28} color="var(--primary)" />
            <h1 className="page-title">Панель управления администратора</h1>
          </div>
          <p className="page-subtitle">
            Просмотр поступающих заявок, модерация и управление этапами проведения конференций
          </p>
        </div>
        <button onClick={fetchAllRequests} className="btn btn-outline btn-sm">
          <RefreshCw size={14} />
          <span>Обновить</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="filters-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="filter-input"
            style={{ paddingLeft: '2.4rem', width: '100%' }}
            placeholder="Поиск по помещению, заявителю, телефону..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="ALL">Все статусы</option>
            <option value="NEW">Новые</option>
            <option value="SCHEDULED">Мероприятие назначено</option>
            <option value="COMPLETED">Завершенные</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Загрузка списка заявок...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card empty-state">
          <h3>Заявки не найдены</h3>
          <p>По выбранным критериям фильтрации нет данных</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Заявитель</th>
                <th>Помещение</th>
                <th>Дата и время</th>
                <th>Оплата</th>
                <th>Текущий статус</th>
                <th>Управление статусом</th>
                <th>Отзыв</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} color="var(--primary)" />
                      {req.user?.fullName || 'Пользователь'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Логин: {req.user?.login}
                    </div>
                    {req.user?.phone && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} />
                        {req.user.phone}
                      </div>
                    )}
                    {req.user?.email && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} />
                        {req.user.email}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{req.roomName}</span>
                  </td>
                  <td>{formatDateTime(req.startDate)}</td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{formatPaymentMethod(req.paymentMethod)}</span>
                  </td>
                  <td>
                    <StatusBadge status={req.status} />
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={req.status}
                      disabled={updatingId === req.id}
                      onChange={(e) => handleStatusChange(req.id, e.target.value as RequestStatus)}
                    >
                      <option value="NEW">Новая</option>
                      <option value="SCHEDULED">Мероприятие назначено</option>
                      <option value="COMPLETED">Завершено</option>
                    </select>
                  </td>
                  <td style={{ maxWidth: '240px' }}>
                    {req.review ? (
                      <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        «{req.review}»
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Отзыв не оставлен
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
