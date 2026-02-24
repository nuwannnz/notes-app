import * as cdk from 'aws-cdk-lib'
import { DatabaseStack } from '../lib/stacks/database-stack'
import { AuthStack } from '../lib/stacks/auth-stack'
import { ApiStack } from '../lib/stacks/api-stack'
import { FrontendStack } from '../lib/stacks/frontend-stack'

const app = new cdk.App()

// Pass --context env=dev|prod  (defaults to dev)
const envName = (app.node.tryGetContext('env') as string | undefined) ?? 'dev'
if (envName !== 'dev' && envName !== 'prod') {
  throw new Error(`Invalid env context value "${envName}". Must be "dev" or "prod".`)
}

const envCap = envName === 'prod' ? 'Prod' : 'Dev'
const prefix = `NotesApp-${envCap}`

const awsEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
}

const dbStack = new DatabaseStack(app, `${prefix}-Database`, { env: awsEnv, envName })
const authStack = new AuthStack(app, `${prefix}-Auth`, { env: awsEnv, envName })
const apiStack = new ApiStack(app, `${prefix}-Api`, {
  env: awsEnv,
  envName,
  table: dbStack.table,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
})
const frontendStack = new FrontendStack(app, `${prefix}-Frontend`, {
  env: awsEnv,
  envName,
  apiUrl: apiStack.apiUrl,
  userPoolId: authStack.userPool.userPoolId,
  userPoolClientId: authStack.userPoolClient.userPoolClientId,
})

frontendStack.addDependency(apiStack)
