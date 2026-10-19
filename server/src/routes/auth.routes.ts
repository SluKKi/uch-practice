import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import { JWT_SECRET } from '../config.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = Router();

router.post('/register', validateRegister, async (req: Request, res: Response): Promise<void> => {
  try {
    const { login, password, fullName, phone, email } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { login: login.trim() },
    });

    if (existingUser) {
      res.status(409).json({ message: 'Пользователь с таким логином уже существует' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        login: login.trim(),
        password: hashedPassword,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      },
      select: {
        id: true,
        login: true,
        fullName: true,
        phone: true,
        email: true,
        role: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, login: user.login, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Регистрация успешно завершена',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
});

router.post('/login', validateLogin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { login, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { login: login.trim() },
    });

    if (!user) {
      res.status(401).json({ message: 'Неверный логин или пароль' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Неверный логин или пароль' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, login: user.login, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Успешная авторизация',
      token,
      user: {
        id: user.id,
        login: user.login,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера при авторизации' });
  }
});

export default router;
