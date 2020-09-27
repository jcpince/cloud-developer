import { SNSHandler, SNSEvent } from 'aws-lambda'
import 'source-map-support/register'
import { updateItemAttachment } from '../../businessLogic/todos'

export const handler: SNSHandler = async (event: SNSEvent) => {
  console.log('Processing SNS event ', JSON.stringify(event))
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)

    await updateItemAttachment(s3Event)
  }
}