import 'source-map-support/register'
import { SNSEvent, SNSHandler } from 'aws-lambda'

import { updateAttachmentUrl } from '../../businessLogic/todos'


export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event ', JSON.stringify(event))
    
    // Get SNS message
    const snsMessage = event.Records[0].Sns.Message;
    const { userId, todoId } = JSON.parse(snsMessage);
  
    // Update attachment
    await updateAttachmentUrl(userId, todoId)
  }