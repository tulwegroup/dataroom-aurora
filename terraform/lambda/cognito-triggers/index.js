/* eslint-disable @typescript-eslint/no-require-imports */
// Aurora OSI Data Room - Cognito Triggers Lambda
// ===============================================

const { DynamoDB } = require('@aws-sdk/client-dynamodb')
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb')

const dynamodb = new DynamoDB({ region: process.env.AWS_REGION })
const AUDIT_LOGS_TABLE = process.env.AUDIT_LOGS_TABLE

exports.handler = async (event) => {
  console.log('Cognito trigger event:', JSON.stringify(event, null, 2))

  // Handle different trigger types
  if (event.triggerSource === 'PostAuthentication_Authentication') {
    await handlePostAuthentication(event)
  } else if (event.triggerSource === 'TokenGeneration_Authentication') {
    await handleTokenGeneration(event)
  }

  return event
}

async function handlePostAuthentication(event) {
  const userId = event.userName
  const userEmail = event.request.userAttributes.email
  const sourceIp = event.request.userAttributes['custom:sourceIp'] || 'unknown'

  // Log the authentication event
  const auditLog = {
    PK: `USER#${userId}`,
    SK: `AUTH#${Date.now()}`,
    action: 'LOGIN',
    userId: userId,
    email: userEmail,
    ipAddress: sourceIp,
    userAgent: event.request.userAttributes['custom:userAgent'] || 'unknown',
    timestamp: new Date().toISOString(),
    TTL: Math.floor(Date.now() / 1000) + (2555 * 24 * 60 * 60)
  }

  try {
    await dynamodb.putItem({
      TableName: AUDIT_LOGS_TABLE,
      Item: marshall(auditLog)
    })
    console.log('Audit log created for login:', userId)
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

async function handleTokenGeneration(event) {
  const userAttributes = event.request.userAttributes

  event.response.claimsOverrideDetails = {
    claimsToAddOrOverride: {
      'custom:role': userAttributes['custom:role'] || 'VIEWER',
      'custom:access_tier': userAttributes['custom:access_tier'] || 'TEASER',
      'custom:company': userAttributes['custom:company'] || ''
    }
  }

  return event
}
