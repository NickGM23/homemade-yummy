import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { z, ZodTypeAny } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type UseZodFormReturn<TSchema extends ZodTypeAny> = UseFormReturn<z.input<TSchema>> & {
  handleSubmitZod: (
    onValid: (data: z.output<TSchema>) => void | Promise<void>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
};

export function useZodForm<TSchema extends ZodTypeAny>(
  schema: TSchema,
  props?: UseFormProps<z.input<TSchema>>,
): UseZodFormReturn<TSchema> {
  const form = useForm<z.input<TSchema>>({
    resolver: zodResolver(schema),
    ...props,
  });

  const handleSubmitZod = (onValid: (data: z.output<TSchema>) => void | Promise<void>) =>
    form.handleSubmit((data) => onValid(data as z.output<TSchema>));

  return {
    ...form,
    handleSubmitZod,
  };
}
