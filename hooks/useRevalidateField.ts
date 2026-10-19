import React from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';

/**
 * Після зміни поля `source` повторно перевіряє поле `target`, якщо воно вже заповнене.
 * Потрібно для залежних полів (пароль → «повторіть пароль»): у режимі `onChange` react-hook-form
 * перевіряє лише поле, яке змінюють, тож помилка «Паролі не співпадають» інакше лишалась би
 * застарілою (або не з'являлась), доки не натиснути кнопку відправки.
 */
export function useRevalidateField<T extends FieldValues>(
  form: Pick<UseFormReturn<T>, 'watch' | 'trigger' | 'getValues'>,
  source: Path<T>,
  target: Path<T>,
) {
  const { watch, trigger, getValues } = form;

  React.useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (name === source && getValues(target)) {
        void trigger(target);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, trigger, getValues, source, target]);
}
