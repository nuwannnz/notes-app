import * as cdk from 'aws-cdk-lib'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

export interface DatabaseStackProps extends cdk.StackProps {
  envName: string
}

export class DatabaseStack extends cdk.Stack {
  public readonly table: dynamodb.Table

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props)

    const isProd = props.envName === 'prod'

    this.table = new dynamodb.Table(this, 'NotesAppTable', {
      tableName: `NotesAppTable-${props.envName}`,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: isProd,
    })

    // GSI1 for folder-filtered note queries
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    })

    new cdk.CfnOutput(this, 'TableName', {
      value: this.table.tableName,
      exportName: `NotesApp-${props.envName}-TableName`,
    })
  }
}
