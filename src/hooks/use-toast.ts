import { toast as sonnerToast } from 'sonner';

export function useToast() {
  return {
    toast: (props: {
      title?: string;
      description?: string;
      variant?: 'default' | 'destructive';
    }) => {
      const { title, description, variant } = props;
      const message = title ? `${title}${description ? `: ${description}` : ''}` : description;

      if (variant === 'destructive') {
        sonnerToast.error(message);
      } else {
        sonnerToast.success(message);
      }
    },
  };
}
