import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast bg-white text-slate-950 border border-slate-200 shadow-lg dark:bg-slate-950 dark:text-slate-50 dark:border-slate-800",
          description: "text-slate-500 dark:text-slate-400",
          actionButton: "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900",
          cancelButton: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
          error: "!bg-red-500 !text-white !border-red-600",
          success: "!bg-green-500 !text-white !border-green-600",
          warning: "!bg-yellow-500 !text-white !border-yellow-600",
          info: "!bg-blue-500 !text-white !border-blue-600",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
