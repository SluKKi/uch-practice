import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle, Building, Calendar, CreditCard } from 'lucide-react';
import { createRequest } from '../api/requests';
import { PaymentMethod } from '../types';
import { ApiError } from '../api/client';

export const CreateRequestPage: React.FC = () => {
  const navigate = useNavigate();

  const [roomChoice, setRoomChoice] = useState<string>('Аудитория');
  const [customRoom, setCustomRoom] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('IN_PERSON');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const getFinalRoomName = (): string => {
    if (roomChoice === 'OTHER') {
      return customRoom.trim();
    }
    return roomChoice;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const finalRoom = getFinalRoomName();

    if (!finalRoom) {
      newErrors.roomName = 'Укажите наименование помещения';
    }

    if (!startDate) {
      newErrors.startDate = 'Выберите дату и время начала мероприятия';
    } else {
      const selected = new Date(startDate).getTime();
      if (isNaN(selected)) {
        newErrors.startDate = 'Некорректная дата и время';
      }
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Выберите способ оплаты';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest({
        roomName: getFinalRoomName(),
        startDate: new Date(startDate).toISOString(),
        paymentMethod,
      });

      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setGeneralError(err.message);
        if (err.errors) {
          setErrors(err.errors);
        }
      } else {
        setGeneralError('Не удалось создать заявку. Повторите попытку.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/dashboard" className="btn btn-outline btn-sm">
          <ArrowLeft size={16} />
          <span>Вернуться к моим заявкам</span>
        </Link>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>
            Формирование заявки на бронирование
          </h1>
          <p className="page-subtitle">
            Заполните параметры проведения конференции для отправки администратору
          </p>
        </div>

        {generalError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="roomChoice">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={16} />
                Тип или название помещения
              </span>
            </label>
            <select
              id="roomChoice"
              value={roomChoice}
              onChange={(e) => setRoomChoice(e.target.value)}
            >
              <option value="Аудитория">Аудитория</option>
              <option value="Коворкинг">Коворкинг</option>
              <option value="Кинозал">Кинозал</option>
              <option value="OTHER">Другое помещение (указать вручную)</option>
            </select>
          </div>

          {roomChoice === 'OTHER' && (
            <div className="form-group">
              <label className="form-label" htmlFor="customRoom">
                Наименование помещения
              </label>
              <input
                id="customRoom"
                type="text"
                placeholder="Например: Большой конференц-зал Президиума"
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
              />
              {errors.roomName && (
                <div className="form-error">
                  <AlertCircle size={14} />
                  <span>{errors.roomName}</span>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="startDate">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} />
                Желаемая дата и время начала конференции
              </span>
            </label>
            <input
              id="startDate"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            {errors.startDate && (
              <div className="form-error">
                <AlertCircle size={14} />
                <span>{errors.startDate}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="paymentMethod">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <CreditCard size={16} />
                Способ оплаты
              </span>
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="IN_PERSON">При очном посещении</option>
              <option value="SBP">Переводом по системе СБП</option>
            </select>
            {errors.paymentMethod && (
              <div className="form-error">
                <AlertCircle size={14} />
                <span>{errors.paymentMethod}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Link to="/dashboard" className="btn btn-outline" style={{ flex: 1 }}>
              Отмена
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={isSubmitting}
            >
              <Send size={18} />
              <span>{isSubmitting ? 'Отправка...' : 'Отправить заявку'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
