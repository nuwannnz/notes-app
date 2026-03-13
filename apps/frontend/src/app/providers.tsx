import { type ReactNode } from "react";
import { AuthProvider } from "@/features/auth/AuthContext";
import { configureAws } from "@/config/aws-config";

// Configure AWS Amplify once at module load time
configureAws();

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
