# Aurora OSI Data Room - Terraform Outputs
# =========================================

# =============================================================================
# CloudFront Distribution
# =============================================================================

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidation"
  value       = aws_cloudfront_distribution.data_room.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.data_room.domain_name
}

output "website_url" {
  description = "Full website URL"
  value       = "https://${var.domain_name}"
}

# =============================================================================
# API Gateway
# =============================================================================

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.data_room.id
}

output "api_gateway_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_api.data_room.api_endpoint
}

output "api_gateway_stage_name" {
  description = "API Gateway stage name"
  value       = aws_apigatewayv2_stage.production.name
}

# =============================================================================
# Cognito User Pool
# =============================================================================

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.data_room.id
}

output "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.data_room.arn
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.web_app.id
}

output "cognito_domain" {
  description = "Cognito domain for hosted UI"
  value       = aws_cognito_user_pool_domain.data_room.domain
}

output "cognito_login_url" {
  description = "Cognito hosted login URL"
  value       = "https://${aws_cognito_user_pool_domain.data_room.domain}.auth.${var.aws_region}.amazoncognito.com/login?client_id=${aws_cognito_user_pool_client.web_app.id}&response_type=code&scope=email+openid+profile&redirect_uri=https://${var.domain_name}/callback"
}

# =============================================================================
# S3 Buckets
# =============================================================================

output "documents_bucket_name" {
  description = "S3 bucket for original documents"
  value       = aws_s3_bucket.documents.id
}

output "documents_bucket_arn" {
  description = "S3 bucket ARN for original documents"
  value       = aws_s3_bucket.documents.arn
}

output "watermarked_bucket_name" {
  description = "S3 bucket for watermarked documents"
  value       = aws_s3_bucket.watermarked.id
}

output "access_logs_bucket_name" {
  description = "S3 bucket for access logs"
  value       = aws_s3_bucket.access_logs.id
}

output "cloudtrail_bucket_name" {
  description = "S3 bucket for CloudTrail logs"
  value       = aws_s3_bucket.cloudtrail.id
}

# =============================================================================
# DynamoDB Tables
# =============================================================================

output "metadata_table_name" {
  description = "DynamoDB table for metadata"
  value       = aws_dynamodb_table.metadata.name
}

output "metadata_table_arn" {
  description = "DynamoDB table ARN for metadata"
  value       = aws_dynamodb_table.metadata.arn
}

output "audit_logs_table_name" {
  description = "DynamoDB table for audit logs"
  value       = aws_dynamodb_table.audit_logs.name
}

output "audit_logs_table_arn" {
  description = "DynamoDB table ARN for audit logs"
  value       = aws_dynamodb_table.audit_logs.arn
}

# =============================================================================
# KMS Key
# =============================================================================

output "kms_key_id" {
  description = "KMS key ID"
  value       = aws_kms_key.data_room.key_id
}

output "kms_key_arn" {
  description = "KMS key ARN"
  value       = aws_kms_key.data_room.arn
}

output "kms_key_alias" {
  description = "KMS key alias"
  value       = aws_kms_alias.data_room.name
}

# =============================================================================
# WAF
# =============================================================================

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = aws_wafv2_web_acl.data_room.arn
}

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = aws_wafv2_web_acl.data_room.id
}

# =============================================================================
# Route 53
# =============================================================================

output "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.data_room.zone_id
}

output "nameservers" {
  description = "Nameservers to configure at domain registrar"
  value       = aws_route53_zone.data_room.name_servers
}

# =============================================================================
# SES
# =============================================================================

output "ses_domain_identity_arn" {
  description = "SES domain identity ARN"
  value       = aws_ses_domain_identity.data_room.arn
}

output "ses_configuration_set_name" {
  description = "SES configuration set name"
  value       = aws_ses_configuration_set.data_room.name
}

# =============================================================================
# SNS
# =============================================================================

output "sns_alerts_topic_arn" {
  description = "SNS topic ARN for alerts"
  value       = aws_sns_topic.alerts.arn
}

output "sns_alerts_topic_name" {
  description = "SNS topic name for alerts"
  value       = aws_sns_topic.alerts.name
}

# =============================================================================
# Lambda Functions
# =============================================================================

output "lambda_cognito_triggers_arn" {
  description = "Cognito triggers Lambda function ARN"
  value       = aws_lambda_function.cognito_triggers.arn
}

output "lambda_document_processor_arn" {
  description = "Document processor Lambda function ARN"
  value       = aws_lambda_function.document_processor.arn
}

# =============================================================================
# CloudWatch
# =============================================================================

output "cloudwatch_log_group_api_gateway" {
  description = "CloudWatch log group for API Gateway"
  value       = aws_cloudwatch_log_group.api_gateway.name
}

# =============================================================================
# CloudTrail
# =============================================================================

output "cloudtrail_arn" {
  description = "CloudTrail ARN"
  value       = aws_cloudtrail.data_room.arn
}

output "cloudtrail_name" {
  description = "CloudTrail name"
  value       = aws_cloudtrail.data_room.name
}

# =============================================================================
# IAM Roles
# =============================================================================

output "lambda_execution_role_arn" {
  description = "Lambda execution role ARN"
  value       = aws_iam_role.lambda_execution.arn
}

# =============================================================================
# Environment Variables for Frontend
# =============================================================================

output "frontend_environment_variables" {
  description = "Environment variables to configure in the frontend application"
  value = {
    NEXT_PUBLIC_COGNITO_USER_POOL_ID     = aws_cognito_user_pool.data_room.id
    NEXT_PUBLIC_COGNITO_CLIENT_ID        = aws_cognito_user_pool_client.web_app.id
    NEXT_PUBLIC_COGNITO_DOMAIN           = aws_cognito_user_pool_domain.data_room.domain
    NEXT_PUBLIC_API_URL                  = "https://${var.domain_name}/api"
    NEXT_PUBLIC_AWS_REGION               = var.aws_region
  }
}

# =============================================================================
# Configuration Summary
# =============================================================================

output "deployment_summary" {
  description = "Summary of the deployment configuration"
  value = {
    environment    = var.environment
    domain         = var.domain_name
    region         = var.aws_region
    website_url    = "https://${var.domain_name}"
    login_url      = "https://${aws_cognito_user_pool_domain.data_room.domain}.auth.${var.aws_region}.amazoncognito.com/login"
    api_endpoint   = aws_apigatewayv2_api.data_room.api_endpoint
    nameservers    = aws_route53_zone.data_room.name_servers
  }
}
