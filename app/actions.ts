'use server';

import { prisma } from '@/server/prisma';

import { hashSync } from 'bcrypt';
import { getUserSession } from '@/server/get-user-session';
import { updateUserInfoSchema } from '@/server/validation/user';

type ActionResult =
  | { success: true }
  | {
      success: false;
      error?: string;
      fieldErrors?: Record<string, string>;
    };

interface UpdateUserInfoBody {
  email?: string | null;
  fullName: string;
  password?: string;
}

export async function updateUserInfo(body: UpdateUserInfoBody): Promise<ActionResult> {
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
    // Порожній email = «не вказано» (email — лише контакт, входити за ним не можна).
    const newEmail = email ?? null;

    const emailChanged = newEmail !== findUser.email;

    if (emailChanged && newEmail !== null) {
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail },
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
        ...(emailChanged && { email: newEmail }),
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
