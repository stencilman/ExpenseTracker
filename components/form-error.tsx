import { TriangleAlert } from "lucide-react";

interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) => {
  return (
    message && (
      <div className="bg-destructive p-3 rounded-md text-white flex items-center gap-x-2 text-sm text-destructive-foreground">
        <TriangleAlert className="h-4 w-4" />
        {message}
      </div>
    )
  );
};
