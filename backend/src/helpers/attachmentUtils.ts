import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)


export class AttachmentUtils{
  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4'}),
    private readonly s3BucketName = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  getAttachmentUrl(todoId: string) {
    return `https://${this.s3BucketName}.s3.amazonaws.com/${todoId}`
  }

  getPreSignedUrl(todoId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}