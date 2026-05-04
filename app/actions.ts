'use server';

import { prisma } from '@/libs/prisma';
import { VerificationUserTemplate } from '@/components/shared/email-temapltes/verification-user';

import { sendEmail } from '@/components/shared/lib';
import { Prisma } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { cookies } from 'next/headers';
import { getUserSession } from '@/components/shared/lib/get-user-session';

type ActionResult =
  | { success: true }
  | {
      success: false;
      error?: string;
      fieldErrors?: Record<string, string>;
    };

export async function updateUserInfo(body: Prisma.UserUpdateInput): Promise<ActionResult> {
  try {
    const currentUser = await getUserSession();

    if (!currentUser) {
      return {
        success: false,
        error: 'Сесія закінчилась. Увійдіть знову',
      };
    }

    const userId = Number(currentUser.id);

    const findUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!findUser) {
      return {
        success: false,
        error: 'Користувача не знайдено',
      };
    }

    if (body.email && body.email !== findUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email as string },
      });

      if (existingUser) {
        return {
          success: false,
          fieldErrors: {
            email: 'Цей email вже використовується',
          },
        };
      }
    }

    const hasPassword = !!body.password?.toString().trim();

    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: body.fullName,
        ...(body.email &&
          body.email !== findUser.email && {
            email: body.email,
          }),
        ...(hasPassword && {
          password: await hashSync(body.password as string, 10),
        }),
      },
    });

    return { success: true };
  } catch (err) {
    console.log('Error [UPDATE_USER]', err);

    return {
      success: false,
      error: 'Помилка сервера. Спробуйте пізніше',
    };
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
