import { type ReactNode, useEffect } from 'react'
import { AuthProvider } from '@/features/auth/AuthContext'
import { configureAws } from '@/config/aws-config'
import { syncEngine } from '@/services/sync/SyncEngine'

// Configure AWS Amplify once at module load time
configureAws()

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    syncEngine.start()
    return () => syncEngine.stop()
  }, [])

  return <AuthProvider>{children}</AuthProvider>
}
