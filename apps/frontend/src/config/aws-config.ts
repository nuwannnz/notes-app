import { Amplify } from 'aws-amplify'

export function configureAws() {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
  const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID
  const apiUrl = import.meta.env.VITE_API_URL

  if (!userPoolId || !userPoolClientId) {
    console.warn('[AWS] Cognito not configured — running in offline-only mode')
    return
  }

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          email: true,
        },
      },
    },
    API: {
      REST: {
        NotesApi: {
          endpoint: apiUrl ?? '',
          region: import.meta.env.VITE_AWS_REGION ?? 'us-east-1',
        },
      },
    },
  })
}
