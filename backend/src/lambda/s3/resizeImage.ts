import 'source-map-support/register'
import Jimp from 'jimp'
import AWSXRay from 'aws-xray-sdk';
import * as AWS from 'aws-sdk'
import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'


const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3()

const attachmentS3BucketName = process.env.ATTACHMENT_S3_BUCKET
const thumbnailsS3BucketName = process.env.THUMBNAILS_S3_BUCKET

export const handler: SNSHandler = async (event: SNSEvent) => {
  console.log('Processing SNS event ', JSON.stringify(event))
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)

    for (const record of s3Event.Records) {
      await processImage(record)
    }
  }
}

async function processImage(record: S3EventRecord) {
  if (attachmentS3BucketName === undefined) {
    throw new Error('attachmentS3BucketName is not defined')
  }
  
  if (thumbnailsS3BucketName === undefined) {
    throw new Error('thumbnailsS3BucketName is not defined')
  }


  const key = record.s3.object.key
  console.log('Processing S3 item with key: ', key)
  const response = await s3
    .getObject({
      Bucket: attachmentS3BucketName,
      Key: key
    })
    .promise()

  const body = response.Body as Buffer
  const image = await Jimp.read(body)

  console.log('Resizing image')
  image.resize(150, Jimp.AUTO)
  const convertedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG)

  console.log(`Writing image back to S3 bucket: ${thumbnailsS3BucketName}`)
  await s3
    .putObject({
      Bucket: thumbnailsS3BucketName,
      Key: `${key}`,
      Body: convertedBuffer
    })
    .promise()
}
