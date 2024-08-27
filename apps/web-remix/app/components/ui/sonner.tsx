import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: <CircleCheck className="w-5 h-5 text-green-500" />,
        error: <CircleAlert className="w-5 h-5 text-red-500" />,
        warning: <TriangleAlert className="w-5 h-5 text-orange-500" />,
      }}
      toastOptions={{
        classNames: {
          closeButton: 'bg-secondary text-secondary-foreground',
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg border border-input',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-secondary group-[.toast]:text-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
