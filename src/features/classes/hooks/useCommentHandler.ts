import { useSaveComment } from "@/features/classes/hooks/useSaveComment";
import { type ApiFieldError } from "@/features/classes/types/classTypes";
import { toast } from "@/shared/components/ui/toast";

// Saves one submission's comment, toasts the outcome and reloads the list; returns field errors for the form.
export function useCommentHandler(reload: () => void) {
  const { saveComment } = useSaveComment();

  return (submissionId: string) =>
    async (content: string): Promise<ApiFieldError[] | null> => {
      const outcome = await saveComment(submissionId, content);
      if ("message" in outcome) {
        toast.success(outcome.message);
        reload();
        return null;
      }
      if (outcome.error.fieldErrors.length === 0) toast.error(outcome.error.message);
      return outcome.error.fieldErrors;
    };
}
