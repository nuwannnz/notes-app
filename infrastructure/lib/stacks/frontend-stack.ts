import * as cdk from 'aws-cdk-lib'
import * as path from 'path'
import { Construct } from 'constructs'
import { HostingConstruct } from '../constructs/hosting-construct'

export interface FrontendStackProps extends cdk.StackProps {
  envName: string
  apiUrl: string
  userPoolId: string
  userPoolClientId: string
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontendStackProps) {
    super(scope, id, props)

    new HostingConstruct(this, 'Hosting', {
      frontendDistPath: path.join(__dirname, '../../../apps/frontend/dist'),
    })

    new cdk.CfnOutput(this, 'ApiUrl', { value: props.apiUrl })
    new cdk.CfnOutput(this, 'UserPoolId', { value: props.userPoolId })
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: props.userPoolClientId })
  }
}
