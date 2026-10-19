import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login: '',
    password: '',
    fullName: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const formatPhone = (input: string): string => {
    const rawDigits = input.replace(/\D/g, '');
    if (!rawDigits) return '';
    let digits = rawDigits;
    if (digits.startsWith('7') || digits.startsWith('8')) {
      digits = digits.slice(1);
    }
    let formatted = '8(';
    if (digits.length > 0) formatted += digits.slice(0, 3);
    if (digits.length >= 3) formatted += ')' + digits.slice(3, 6);
    if (digits.length >= 6) formatted += '-' + digits.slice(6, 8);
    if (digits.length >= 8) formatted += '-' + digits.slice(8, 10);
    return formatted;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const loginRegex = /^[a-zA-Z0-9]{6,}$/;
    if (!formData.login.trim()) {
      newErrors.login = 'Логин обязателен для заполнения';
    } else if (!loginRegex.test(formData.login.trim())) {
      newErrors.login = 'Логин должен содержать только латиницу и цифры, не менее 6 символов';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен для заполнения';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен содержать минимум 8 символов';
    }

    const fullNameRegex = /^[а-яА-ЯёЁ\s]+$/;
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'ФИО обязательно для заполнения';
    } else if (!fullNameRegex.test(formData.fullName.trim())) {
      newErrors.fullName = 'ФИО должно содержать только символы кириллицы и пробелы';
    }

    const phoneRegex = /^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Номер телефона обязателен';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Телефон должен строго соответствовать формату 8(XXX)XXX-XX-XX';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Введите корректный адрес электронной почты';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register({
        login: formData.login.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
      });

      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setGeneralError(err.message);
        if (err.errors) {
          setErrors(err.errors);
        }
      } else {
        setGeneralError('Произошла непредвиденная ошибка при регистрации');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Регистрация</h1>
          <p>Создайте аккаунт в системе «Конференции.РФ»</p>
        </div>

        {generalError && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login">
              Логин (латиница и цифры, от 6 знаков)
            </label>
            <input
              id="login"
              name="login"
              type="text"
              autoComplete="username"
              placeholder="ivanov2027"
              value={formData.login}
              onChange={handleChange}
            />
            {errors.login && (
              <div className="form-error">
                <AlertCircle size={14} />
                <span>{errors.login}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Пароль (минимум 8 знаков)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <div className="form-error">
                <AlertCircle size={14} />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              ФИО (символы кириллицы и пробелы)
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Иванов Иван Иванович"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <div className="form-error">
                <AlertCircle size={14} />
                <span>{errors.fullName}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Телефон в формате 8(XXX)XXX-XX-XX
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              placeholder="8(999)123-45-67"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <div className="form-error">
                <AlertCircle size={14} />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Адрес электронной почты
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="ivanov@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <div className="form-error">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            disabled={isSubmitting}
          >
            <UserPlus size={18} />
            <span>{isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Уже зарегистрированы? <Link to="/login">Войти в аккаунт</Link>
        </div>
      </div>
    </div>
  );
};
