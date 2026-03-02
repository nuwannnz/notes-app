import * as cdk from 'aws-cdk-lib'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { NodeLambda } from './lambda-construct'

export interface ApiConstructProps {
  table: dynamodb.Table
  userPool: cognito.UserPool
  userPoolClient: cognito.UserPoolClient
  stageName: string
}

export class ApiConstruct extends Construct {
  public readonly api: apigw.RestApi
  public readonly apiUrl: string

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id)

    const nodeLambda = new NodeLambda(this, 'BackendLambda', {
      table: props.table,
      environment: {
        COGNITO_USER_POOL_ID: props.userPool.userPoolId,
        COGNITO_CLIENT_ID: props.userPoolClient.userPoolClientId,
      },
    })
    const integration = new apigw.LambdaIntegration(nodeLambda.fn)

    this.api = new apigw.RestApi(this, 'RestApi', {
      restApiName: 'NotesAppApi',
      deployOptions: { stageName: props.stageName },
      defaultCorsPreflightOptions: {
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: apigw.Cors.ALL_METHODS,
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        maxAge: cdk.Duration.days(1),
      },
    })

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [props.userPool],
    })

    const methodOptions: apigw.MethodOptions = {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO,
    }

    this.api.root.addMethod('ANY', integration, methodOptions)
    this.api.root.addProxy({
      defaultIntegration: integration,
      defaultMethodOptions: methodOptions,
      anyMethod: true,
    })

    this.apiUrl = `https://${this.api.restApiId}.execute-api.${cdk.Stack.of(this).region}.amazonaws.com/${this.api.deploymentStage.stageName}`
  }
}
