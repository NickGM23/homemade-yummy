'use server';

import { prisma } from '@/libs/prisma';

import { Prisma } from '@prisma/client';
import { hashSync } from 'bcrypt';
import { getUserSession } from '@/components/shared/lib/get-user-session';
import { updateUserInfoSchema } from '@/libs/validation/user';

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

    const parsed = updateUserInfoSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(([field, messages]) => [
          field,
          messages?.[0] ?? 'Некоректне значення',
        ]),
      );

      return { success: false, fieldErrors };
    }

    const { email, fullName, password } = parsed.data;

    if (email !== findUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
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

    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        ...(email !== findUser.email && { email }),
        ...(password && {
          password: hashSync(password, 10),
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

    //const createdUser = await prisma.user.create({
    //; data: {
    //   fullName: body.fullName,
    //   email: body.email,
    //   password: hashSync(body.password, 10),
    //   provider: 'credentials',
    // },
    //});

    //const code = Math.floor(100000 + Math.random() * 900000).toString();

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
