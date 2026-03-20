/* eslint-disable @typescript-eslint/no-require-imports */
// Aurora OSI Data Room - Document Processor Lambda
// =================================================

const { S3 } = require('@aws-sdk/client-s3')
const { DynamoDB } = require('@aws-sdk/client-dynamodb')
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb')

const s3 = new S3({ region: process.env.AWS_REGION })
const dynamodb = new DynamoDB({ region: process.env.AWS_REGION })

const DOCUMENTS_BUCKET = process.env.DOCUMENTS_BUCKET
const WATERMARKED_BUCKET = process.env.WATERMARKED_BUCKET
const METADATA_TABLE = process.env.METADATA_TABLE
const AUDIT_LOGS_TABLE = process.env.AUDIT_LOGS_TABLE
const KMS_KEY_ID = process.env.KMS_KEY_ID

exports.handler = async (event) => {
  console.log('Document processor event:', JSON.stringify(event, null, 2))

  for (const record of event.Records) {
    try {
      if (record.eventSource === 'aws:s3') {
        await processS3Event(record)
      }
    } catch (error) {
      console.error('Error processing record:', error)
    }
  }
}

async function processS3Event(record) {
  const bucket = record.s3.bucket.name
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '))
  const eventName = record.eventName

  if (eventName.startsWith('ObjectCreated')) {
    await handleDocumentUpload(bucket, key)
  } else if (eventName.startsWith('ObjectRemoved')) {
    await handleDocumentDelete(bucket, key)
  }
}

async function handleDocumentUpload(bucket, key) {
  console.log(`Processing upload: ${bucket}/${key}`)
  
  const metadataKey = key.split('/').pop()
  
  await createAuditLog({
    action: 'DOCUMENT_UPLOADED',
    documentId: metadataKey,
    details: { bucket, key }
  })
}

async function handleDocumentDelete(bucket, key) {
  console.log(`Processing delete: ${bucket}/${key}`)

  try {
    await s3.deleteObject({
      Bucket: WATERMARKED_BUCKET,
      Key: key
    })
  } catch (error) {
    // Ignore if file doesn't exist
  }

  await createAuditLog({
    action: 'DOCUMENT_DELETED',
    documentId: key.split('/').pop(),
    details: { bucket, key }
  })
}

async function createAuditLog({ action, documentId, userId, details }) {
  const timestamp = Date.now()

  await dynamodb.putItem({
    TableName: AUDIT_LOGS_TABLE,
    Item: marshall({
      PK: `AUDIT#${timestamp}`,
      SK: `DOC#${documentId}`,
      action: action,
      documentId: documentId,
      userId: userId || 'SYSTEM',
      details: JSON.stringify(details || {}),
      timestamp: new Date().toISOString(),
      TTL: Math.floor(timestamp / 1000) + (2555 * 24 * 60 * 60)
    })
  })
}
