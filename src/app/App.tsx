import { AppRouter } from "@/app/router";
import { AppProviders } from "@/app/providers/AppProviders";
import { PwaUpdatePrompt } from "@/shared/components/PwaUpdatePrompt";
import { Toaster } from "@/shared/components/ui/toast";

export function App() {
  return (
    <AppProviders>
      <AppRouter />
      <Toaster />
      <PwaUpdatePrompt />
    </AppProviders>
  );
}
