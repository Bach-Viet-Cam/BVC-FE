import { type ReactNode } from "react";
import { AuthProvider } from "@/shared/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>{children}</AuthProvider>
    </GoogleOAuthProvider>
  );
}
