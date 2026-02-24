import * as cdk from 'aws-cdk-lib'
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2'
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import * as authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { NodeLambda } from './lambda-construct'

export interface ApiConstructProps {
  table: dynamodb.Table
  userPool: cognito.UserPool
  userPoolClient: cognito.UserPoolClient
}

export class ApiConstruct extends Construct {
  public readonly api: apigwv2.HttpApi
  public readonly apiUrl: string

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id)

    this.api = new apigwv2.HttpApi(this, 'HttpApi', {
      apiName: 'NotesAppApi',
      corsPreflight: {
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: ['*'],
        maxAge: cdk.Duration.days(1),
      },
    })

    const authorizer = new authorizers.HttpJwtAuthorizer(
      'CognitoAuthorizer',
      `https://cognito-idp.${cdk.Stack.of(this).region}.amazonaws.com/${props.userPool.userPoolId}`,
      {
        jwtAudience: [props.userPoolClient.userPoolClientId],
      }
    )

    const nodeLambda = new NodeLambda(this, 'BackendLambda', { table: props.table })
    const integration = new integrations.HttpLambdaIntegration('Integration', nodeLambda.fn)

    this.api.addRoutes({ path: '/{proxy+}', methods: [apigwv2.HttpMethod.ANY], integration, authorizer })
    this.api.addRoutes({ path: '/', methods: [apigwv2.HttpMethod.ANY], integration, authorizer })

    this.apiUrl = this.api.apiEndpoint
  }
}
