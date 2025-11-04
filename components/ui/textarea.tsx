import * as React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxHeight?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, minRows = 3, maxHeight = 300, style, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={minRows}
        style={{
          maxHeight,
          ...style,
        }}
        className={cn(
          'box-border w-full resize-none overflow-y-auto rounded-md border border-input bg-transparent px-3 py-2 pr-12 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
