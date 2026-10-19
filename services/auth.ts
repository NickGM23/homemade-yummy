import { User } from '@prisma/client';
import { axiosInstance } from './instance';
import { ApiRoutes } from './constants';
import type { CodeSentResponse } from './verification';

export const getMe = async () => {
  const { data } = await axiosInstance.get<Pick<User, 'fullName' | 'email' | 'phone'>>('/auth/me');

  return data;
};

export interface RegisterDraft {
  phone: string;
  fullName: string;
  password: string;
}

/** Крок 1 реєстрації: надсилає SMS-код. Користувача буде створено лише після підтвердження коду. */
export const startRegistration = async (draft: RegisterDraft): Promise<CodeSentResponse> => {
  const { data } = await axiosInstance.post<CodeSentResponse>(ApiRoutes.REGISTER_START, draft);
  return data;
};

export const resendRegistrationCode = async (verificationId: string): Promise<CodeSentResponse> => {
  const { data } = await axiosInstance.post<CodeSentResponse>(ApiRoutes.REGISTER_RESEND_CODE, {
    verificationId,
  });
  return data;
};

/** Крок 2: вірний код створює користувача. Далі клієнт сам входить через signIn('credentials'). */
export const confirmRegistration = async (verificationId: string, code: string) => {
  await axiosInstance.post(ApiRoutes.REGISTER_CONFIRM, { verificationId, code });
};
