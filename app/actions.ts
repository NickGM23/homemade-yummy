'use server';

import { prisma } from '@/libs/prisma';
import { VerificationUserTemplate } from '@/components/shared/email-temapltes/verification-user';

import { sendEmail } from '@/components/shared/lib';
import { Prisma } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { cookies } from 'next/headers';
import { getUserSession } from '@/components/shared/lib/get-user-session';

export async function updateUserInfo(body: Prisma.UserUpdateInput) {
  try {
    const currentUser = await getUserSession();

    if (!currentUser) {
      throw new Error('Пользователь не найден');
    }

    const findUser = await prisma.user.findFirst({
      where: {
        id: Number(currentUser.id),
      },
    });

    await prisma.user.update({
      where: {
        id: Number(currentUser.id),
      },
      data: {
        fullName: body.fullName,
        email: body.email,
        password: body.password ? hashSync(body.password as string, 10) : findUser?.password,
      },
    });
  } catch (err) {
    console.log('Error [UPDATE_USER]', err);
    throw err;
  }
}

export async function registerUser(body: Prisma.UserCreateInput) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });

    if (user) {
      if (!user.verified) {
        throw new Error('Почта не подтверждена');
      }

      throw new Error('Пользователь уже существует');
    }

    const createdUser = await prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        password: hashSync(body.password, 10),
        provider: 'credentials',
      },
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    //await prisma.verificationCode.create({
    //  data: {
    //    code,
    //    userId: createdUser.id,
    //  },
    //});

    //await sendEmail(
    //  createdUser.email,
    //  'Next Pizza / 📝 Подтверждение регистрации',
    //  VerificationUserTemplate({
    //    code,
    //  }),
    //);
  } catch (err) {
    console.log('Error [CREATE_USER]', err);
    throw err;
  }
}
