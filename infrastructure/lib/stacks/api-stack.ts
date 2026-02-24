import * as cdk from 'aws-cdk-lib'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'
import { ApiConstruct } from '../constructs/api-construct'

export interface ApiStackProps extends cdk.StackProps {
  envName: string
  table: dynamodb.Table
  userPool: cognito.UserPool
  userPoolClient: cognito.UserPoolClient
}

export class ApiStack extends cdk.Stack {
  public readonly apiUrl: string

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props)

    const api = new ApiConstruct(this, 'Api', {
      table: props.table,
      userPool: props.userPool,
      userPoolClient: props.userPoolClient,
    })

    this.apiUrl = api.apiUrl

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.apiUrl,
      exportName: `NotesApp-${props.envName}-ApiUrl`,
    })
  }
}
