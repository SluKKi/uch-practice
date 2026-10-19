import { Request, Response, NextFunction } from 'express';

const LOGIN_REGEX = /^[a-zA-Z0-9]{6,}$/;
const FULL_NAME_REGEX = /^[а-яА-ЯёЁ\s]+$/;
const PHONE_REGEX = /^8\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req: Request, res: Response, next: NextFunction): void {
  const { login, password, fullName, phone, email } = req.body;
  const errors: Record<string, string> = {};

  if (!login || typeof login !== 'string' || !LOGIN_REGEX.test(login.trim())) {
    errors.login = 'Логин должен содержать только латинские буквы и цифры, не менее 6 символов';
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    errors.password = 'Пароль должен содержать минимум 8 символов';
  }

  if (!fullName || typeof fullName !== 'string' || !FULL_NAME_REGEX.test(fullName.trim()) || fullName.trim().length === 0) {
    errors.fullName = 'ФИО должно содержать только символы кириллицы и пробелы';
  }

  if (!phone || typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
    errors.phone = 'Телефон должен строго соответствовать формату 8(XXX)XXX-XX-XX';
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Укажите корректный адрес электронной почты';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ message: 'Ошибка валидации полей', errors });
    return;
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  const { login, password } = req.body;

  if (!login || !password) {
    res.status(400).json({ message: 'Логин и пароль обязательны' });
    return;
  }

  next();
}
