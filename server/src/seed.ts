import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from './db.js';

export async function seedAdmin() {
  const adminLogin = 'Conf2027';
  const existingAdmin = await prisma.user.findUnique({
    where: { login: adminLogin },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Demo77', 10);
    await prisma.user.create({
      data: {
        login: adminLogin,
        password: hashedPassword,
        fullName: 'Администратор Системы',
        phone: '8(800)555-35-35',
        email: 'admin@conf.rf',
        role: Role.ADMIN,
      },
    });
  }
}
