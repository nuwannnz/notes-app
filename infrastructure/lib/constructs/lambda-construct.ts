import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

export interface NodeLambdaProps {
  table: dynamodb.Table
  environment?: Record<string, string>
}

export class NodeLambda extends Construct {
  public readonly fn: lambda.Function

  constructor(scope: Construct, id: string, props: NodeLambdaProps) {
    super(scope, id)

    this.fn = new lambda.Function(this, 'Fn', {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../apps/backend/dist'),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        TABLE_NAME: props.table.tableName,
        ...props.environment,
      },
    })

    props.table.grantReadWriteData(this.fn)
  }
}
