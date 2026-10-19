import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, CreditCard, MessageSquare, Send, AlertCircle, CheckCircle, FolderOpen } from 'lucide-react';
import { RequestItem } from '../types';
import { getRequests, submitReview } from '../api/requests';
import { StatusBadge } from '../components/StatusBadge';
import { ApiError } from '../api/client';

export const DashboardPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const [reviewTexts, setReviewTexts] = useState<Record<string, string>>({});
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});
  const [submittingReviewId, setSubmittingReviewId] = useState<string | null>(null);
  const [reviewSuccessId, setReviewSuccessId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getRequests();
      setRequests(data);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Не удалось загрузить список заявок');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReviewChange = (id: string, text: string) => {
    setReviewTexts((prev) => ({ ...prev, [id]: text }));
    if (reviewErrors[id]) {
      setReviewErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const handleReviewSubmit = async (id: string) => {
    const text = reviewTexts[id]?.trim();
    if (!text) {
      setReviewErrors((prev) => ({ ...prev, [id]: 'Пожалуйста, напишите отзыв перед отправкой' }));
      return;
    }

    setSubmittingReviewId(id);
    try {
      const updated = await submitReview(id, text);
      setRequests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, review: updated.review } : item))
      );
      setReviewSuccessId(id);
      setTimeout(() => setReviewSuccessId(null), 4000);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setReviewErrors((prev) => ({ ...prev, [id]: err.message }));
      } else {
        setReviewErrors((prev) => ({ ...prev, [id]: 'Не удалось отправить отзыв' }));
      }
    } finally {
      setSubmittingReviewId(null);
    }
  };

  const formatDateTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatPaymentMethod = (method: string): string => {
    return method === 'IN_PERSON' ? 'Очно при посещении' : 'Перевод по системе СБП';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Мои заявки на бронирование</h1>
          <p className="page-subtitle">
            Здесь отображается история ваших заявок и их текущий статус обработки
          </p>
        </div>
        <Link to="/create-request" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Новая заявка</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Загрузка списка заявок...
        </div>
      ) : requests.length === 0 ? (
        <div className="card empty-state">
          <FolderOpen size={48} />
          <h3>У вас пока нет заявок</h3>
          <p style={{ marginBottom: '1.5rem' }}>
            Выберите интересующее помещение и сформируйте заявку на проведение конференции
          </p>
          <Link to="/create-request" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Сформировать первую заявку</span>
          </Link>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map((request) => (
            <div key={request.id} className="request-card">
              <div>
                <div className="request-card-header">
                  <h2 className="request-room-name">{request.roomName}</h2>
                  <StatusBadge status={request.status} />
                </div>

                <div className="request-info-row">
                  <Calendar size={16} />
                  <span>{formatDateTime(request.startDate)}</span>
                </div>

                <div className="request-info-row">
                  <CreditCard size={16} />
                  <span>{formatPaymentMethod(request.paymentMethod)}</span>
                </div>
              </div>

              {request.status === 'COMPLETED' && (
                <div className="review-box">
                  <div className="review-box-title">
                    <MessageSquare size={16} />
                    <span>Отзыв о качестве мероприятия</span>
                  </div>

                  {request.review ? (
                    <div className="review-text">«{request.review}»</div>
                  ) : (
                    <div>
                      {reviewSuccessId === request.id && (
                        <div className="alert alert-success" style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
                          <CheckCircle size={14} />
                          <span>Спасибо за ваш отзыв!</span>
                        </div>
                      )}

                      {reviewErrors[request.id] && (
                        <div className="form-error" style={{ marginBottom: '0.5rem' }}>
                          <AlertCircle size={14} />
                          <span>{reviewErrors[request.id]}</span>
                        </div>
                      )}

                      <textarea
                        rows={3}
                        placeholder="Поделитесь вашим впечатлением о проведенном мероприятии..."
                        value={reviewTexts[request.id] || ''}
                        onChange={(e) => handleReviewChange(request.id, e.target.value)}
                        style={{ resize: 'vertical', marginBottom: '0.5rem' }}
                      />

                      <button
                        type="button"
                        onClick={() => handleReviewSubmit(request.id)}
                        className="btn btn-primary btn-sm"
                        disabled={submittingReviewId === request.id}
                        style={{ width: '100%' }}
                      >
                        <Send size={14} />
                        <span>{submittingReviewId === request.id ? 'Отправка...' : 'Отправить отзыв'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
