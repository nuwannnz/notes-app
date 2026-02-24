import * as cdk from 'aws-cdk-lib'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import { Construct } from 'constructs'

export interface AuthStackProps extends cdk.StackProps {
  envName: string
}

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool
  public readonly userPoolClient: cognito.UserPoolClient

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props)

    const isProd = props.envName === 'prod'

    this.userPool = new cognito.UserPool(this, 'NotesAppUserPool', {
      userPoolName: `NotesAppUserPool-${props.envName}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      email: cognito.UserPoolEmail.withCognito(),
    })

    this.userPoolClient = new cognito.UserPoolClient(this, 'NotesAppUserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `NotesAppWebClient-${props.envName}`,
      authFlows: {
        userSrp: true,
      },
      generateSecret: false,
      preventUserExistenceErrors: true,
    })

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      exportName: `NotesApp-${props.envName}-UserPoolId`,
    })

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      exportName: `NotesApp-${props.envName}-UserPoolClientId`,
    })
  }
}
