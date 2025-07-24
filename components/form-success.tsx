import { CircleCheck } from "lucide-react";


interface FormSuccessProps {
  message?: string | undefined;
}

export const FormSuccess = ({ message }: FormSuccessProps) => {
  
  return (
    message && (
      <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 text-sm  text-emerald-500">
        <CircleCheck className="h-4 w-4" />
        {message}
      </div>
    )
  );
};
