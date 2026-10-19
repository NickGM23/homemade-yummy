import { isAxiosError } from 'axios';

/** Текст помилки з відповіді API (`{ message }`) або запасний, якщо сервер недоступний. */
export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Щось пішло не так. Спробуйте ще раз',
): string => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    // Для помилок валідації сервер повертає технічне 'Validation error' — показуємо запасний текст.
    return error.response.data.message === 'Validation error'
      ? 'Перевірте правильність введених даних'
      : error.response.data.message;
  }
  return fallback;
};
