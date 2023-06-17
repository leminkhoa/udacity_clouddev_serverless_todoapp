import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import AWSXRay from 'aws-xray-sdk';
import * as AWS from 'aws-sdk'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createUploadUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

const XAWS = AWSXRay.captureAWS(AWS)

const SNS = new XAWS.SNS()


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing generateUploadUrl event: ', event)

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const uploadUrl = await createUploadUrl(userId, todoId)

    // Publish message to SNS topic
    await SNS.publish({
      Message: JSON.stringify({ userId, todoId }),
      TopicArn: 'arn:aws:sns:us-east-1:670020652061:updateAttachmentTopic-dev'
    }).promise()

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl: uploadUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
