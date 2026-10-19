import { Router, Response } from 'express';
import { PaymentMethod, RequestStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { AuthenticatedRequest } from '../types.js';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Пользователь не авторизован' });
      return;
    }

    if (req.user.role === 'ADMIN') {
      const requests = await prisma.request.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              login: true,
              fullName: true,
              phone: true,
              email: true,
            },
          },
        },
      });
      res.json(requests);
      return;
    }

    const requests = await prisma.request.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении списка заявок' });
  }
});

router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Пользователь не авторизован' });
      return;
    }

    const { roomName, startDate, paymentMethod } = req.body;
    const errors: Record<string, string> = {};

    if (!roomName || typeof roomName !== 'string' || roomName.trim().length === 0) {
      errors.roomName = 'Название помещения обязательно для заполнения';
    }

    if (!startDate || isNaN(new Date(startDate).getTime())) {
      errors.startDate = 'Укажите корректную дату и время начала мероприятия';
    }

    if (!paymentMethod || !Object.values(PaymentMethod).includes(paymentMethod)) {
      errors.paymentMethod = 'Выберите допустимый способ оплаты (IN_PERSON или SBP)';
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ message: 'Ошибка валидации данных заявки', errors });
      return;
    }

    const newRequest = await prisma.request.create({
      data: {
        userId: req.user.id,
        roomName: roomName.trim(),
        startDate: new Date(startDate),
        paymentMethod: paymentMethod as PaymentMethod,
        status: RequestStatus.NEW,
      },
    });

    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при создании заявки' });
  }
});

router.patch('/:id/status', requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !Object.values(RequestStatus).includes(status)) {
      res.status(400).json({
        message: 'Некорректный статус. Допустимые значения: NEW, SCHEDULED, COMPLETED',
      });
      return;
    }

    const existingRequest = await prisma.request.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      res.status(404).json({ message: 'Заявка не найдена' });
      return;
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: { status: status as RequestStatus },
      include: {
        user: {
          select: {
            id: true,
            login: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при обновлении статуса заявки' });
  }
});

router.patch('/:id/review', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Пользователь не авторизован' });
      return;
    }

    const { id } = req.params;
    const { review } = req.body;

    if (!review || typeof review !== 'string' || review.trim().length === 0) {
      res.status(400).json({ message: 'Текст отзыва не может быть пустым' });
      return;
    }

    const existingRequest = await prisma.request.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      res.status(404).json({ message: 'Заявка не найдена' });
      return;
    }

    if (existingRequest.userId !== req.user.id) {
      res.status(403).json({ message: 'Вы можете оставлять отзывы только к своим заявкам' });
      return;
    }

    if (existingRequest.status !== RequestStatus.COMPLETED) {
      res.status(400).json({
        message: 'Оставить отзыв можно только для заявок со статусом "Завершено"',
      });
      return;
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: { review: review.trim() },
    });

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при сохранении отзыва' });
  }
});

export default router;
