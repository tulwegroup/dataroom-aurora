# Aurora OSI Data Room - AWS Infrastructure
# This Terraform configuration creates a production-grade private data room platform
# with enterprise security, audit logging, and document access controls.

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state management
  # Uncomment and configure for production
  # backend "s3" {
  #   bucket         = "aurora-osi-terraform-state"
  #   key            = "data-room/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "aurora-osi-terraform-locks"
  # }
}

# =============================================================================
# PROVIDER CONFIGURATION
# =============================================================================

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Aurora-OSI-DataRoom"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "Aurora OSI"
    }
  }
}

# =============================================================================
# DATA SOURCES
# =============================================================================

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# =============================================================================
# KMS - Customer Managed Keys for Encryption
# =============================================================================

resource "aws_kms_key" "data_room" {
  description             = "KMS key for Aurora Data Room encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "EnableRootAccountAccess"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowCloudWatchLogs"
        Effect = "Allow"
        Principal = {
          Service = "logs.${var.aws_region}.amazonaws.com"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
        Condition = {
          ArnLike = {
            "kms:EncryptionContext:aws:logs:arn" = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
          }
        }
      }
    ]
  })

  tags = {
    Name = "aurora-data-room-key"
  }
}

resource "aws_kms_alias" "data_room" {
  name          = "alias/aurora-data-room"
  target_key_id = aws_kms_key.data_room.key_id
}

# =============================================================================
# S3 - Document Storage Buckets
# =============================================================================

# Private bucket for original documents
resource "aws_s3_bucket" "documents" {
  bucket        = "${var.project_name}-documents-${var.environment}"
  force_destroy = var.environment != "production"

  tags = {
    Name = "aurora-data-room-documents"
    Type = "documents"
  }
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.data_room.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "documents" {
  bucket = aws_s3_bucket.documents.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    id     = "transition-to-glacier"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 180
      storage_class = "GLACIER"
    }

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "STANDARD_IA"
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# Bucket for watermarked documents
resource "aws_s3_bucket" "watermarked" {
  bucket        = "${var.project_name}-watermarked-${var.environment}"
  force_destroy = var.environment != "production"

  tags = {
    Name = "aurora-data-room-watermarked"
    Type = "watermarked-documents"
  }
}

resource "aws_s3_bucket_versioning" "watermarked" {
  bucket = aws_s3_bucket.watermarked.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "watermarked" {
  bucket = aws_s3_bucket.watermarked.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.data_room.arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "watermarked" {
  bucket = aws_s3_bucket.watermarked.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Logging bucket for S3 access logs
resource "aws_s3_bucket" "access_logs" {
  bucket        = "${var.project_name}-access-logs-${var.environment}"
  force_destroy = var.environment != "production"

  tags = {
    Name = "aurora-data-room-access-logs"
    Type = "access-logs"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "access_logs" {
  bucket = aws_s3_bucket.access_logs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "access_logs" {
  bucket = aws_s3_bucket.access_logs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# =============================================================================
# DynamoDB - Metadata and Audit Logs
# =============================================================================

# Main metadata table
resource "aws_dynamodb_table" "metadata" {
  name         = "${var.project_name}-metadata-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  attribute {
    name = "GSI2PK"
    type = "S"
  }

  attribute {
    name = "GSI2SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "GSI2"
    hash_key        = "GSI2PK"
    range_key       = "GSI2SK"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.data_room.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "aurora-data-room-metadata"
  }
}

# Audit logs table
resource "aws_dynamodb_table" "audit_logs" {
  name         = "${var.project_name}-audit-logs-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = aws_kms_key.data_room.arn
  }

  point_in_time_recovery {
    enabled = true
  }

  ttl {
    attribute_name = "TTL"
    enabled        = true
  }

  tags = {
    Name = "aurora-data-room-audit-logs"
  }
}

# =============================================================================
# Cognito - Authentication
# =============================================================================

resource "aws_cognito_user_pool" "data_room" {
  name = "${var.project_name}-user-pool-${var.environment}"

  auto_verified_attributes = ["email"]

  username_attributes = ["email"]

  mfa_configuration = "OPTIONAL"

  software_token_mfa_configuration {
    enabled = true
  }

  password_policy {
    minimum_length                   = 12
    require_lowercase               = true
    require_numbers                 = true
    require_symbols                 = true
    require_uppercase               = true
    temporary_password_validity_days = 7
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
    invite_message_template {
      email_subject = "Your Aurora Data Room Account"
      email_message = "Your username is {username} and temporary password is {####}. Please change your password upon first login."
    }
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                 = true
    name                    = "company"
    required                = false

    string_attribute_constraints {
      min_length = 0
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                 = true
    name                    = "title"
    required                = false

    string_attribute_constraints {
      min_length = 0
      max_length = 256
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                 = true
    name                    = "role"
    required                = false

    string_attribute_constraints {
      min_length = 0
      max_length = 64
    }
  }

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                 = true
    name                    = "access_tier"
    required                = false

    string_attribute_constraints {
      min_length = 0
      max_length = 64
    }
  }

  lambda_config {
    post_authentication = aws_lambda_function.cognito_triggers.arn
    pre_token_generation = aws_lambda_function.cognito_triggers.arn
  }

  tags = {
    Name = "aurora-data-room-user-pool"
  }
}

resource "aws_cognito_user_pool_domain" "data_room" {
  domain       = "${var.project_name}-${var.environment}"
  user_pool_id = aws_cognito_user_pool.data_room.id
}

resource "aws_cognito_user_pool_client" "web_app" {
  name                                = "${var.project_name}-web-client-${var.environment}"
  user_pool_id                        = aws_cognito_user_pool.data_room.id
  generate_secret                     = false
  refresh_token_validity             = 86400  # 24 hours
  access_token_validity              = 3600   # 1 hour
  id_token_validity                  = 3600   # 1 hour
  token_validity_units {
    access_token  = "seconds"
    id_token      = "seconds"
    refresh_token = "seconds"
  }

  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]

  supported_identity_providers = ["COGNITO"]

  callback_urls = [
    "https://${var.domain_name}",
    "https://${var.domain_name}/callback",
    "http://localhost:3000",
    "http://localhost:3000/callback"
  ]

  logout_urls = [
    "https://${var.domain_name}",
    "https://${var.domain_name}/logout",
    "http://localhost:3000",
    "http://localhost:3000/logout"
  ]

  allowed_oauth_flows = ["code", "implicit"]
  allowed_oauth_scopes = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  read_attributes  = ["email", "name", "custom:company", "custom:title", "custom:role", "custom:access_tier"]
  write_attributes = ["email", "name", "custom:company", "custom:title"]

  prevent_user_existence_errors = "ENABLED"
}

# =============================================================================
# Lambda Functions
# =============================================================================

# IAM role for Lambda functions
resource "aws_iam_role" "lambda_execution" {
  name = "${var.project_name}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_execution" {
  name = "${var.project_name}-lambda-policy-${var.environment}"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.metadata.arn,
          aws_dynamodb_table.audit_logs.arn,
          "${aws_dynamodb_table.metadata.arn}/*",
          "${aws_dynamodb_table.audit_logs.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "${aws_s3_bucket.documents.arn}/*",
          "${aws_s3_bucket.watermarked.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:GenerateDataKey"
        ]
        Resource = aws_kms_key.data_room.arn
      },
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminUpdateUserAttributes"
        ]
        Resource = aws_cognito_user_pool.data_room.arn
      }
    ]
  })
}

# Cognito triggers Lambda
resource "aws_lambda_function" "cognito_triggers" {
  function_name = "${var.project_name}-cognito-triggers-${var.environment}"
  role          = aws_iam_role.lambda_execution.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = "lambda/cognito-triggers.zip"
  source_code_hash = filebase64sha256("lambda/cognito-triggers.zip")

  environment {
    variables = {
      AUDIT_LOGS_TABLE = aws_dynamodb_table.audit_logs.name
    }
  }

  tags = {
    Name = "aurora-data-room-cognito-triggers"
  }
}

# Document processor Lambda
resource "aws_lambda_function" "document_processor" {
  function_name = "${var.project_name}-document-processor-${var.environment}"
  role          = aws_iam_role.lambda_execution.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = "lambda/document-processor.zip"
  source_code_hash = filebase64sha256("lambda/document-processor.zip")
  timeout       = 300
  memory_size   = 1024

  environment {
    variables = {
      DOCUMENTS_BUCKET    = aws_s3_bucket.documents.id
      WATERMARKED_BUCKET  = aws_s3_bucket.watermarked.id
      METADATA_TABLE      = aws_dynamodb_table.metadata.name
      AUDIT_LOGS_TABLE    = aws_dynamodb_table.audit_logs.name
      KMS_KEY_ID          = aws_kms_key.data_room.key_id
    }
  }

  tags = {
    Name = "aurora-data-room-document-processor"
  }
}

# =============================================================================
# API Gateway
# =============================================================================

resource "aws_apigatewayv2_api" "data_room" {
  name          = "${var.project_name}-api-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [
      "https://${var.domain_name}",
      "http://localhost:3000"
    ]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["*"]
    allow_credentials = true
    max_age = 3600
  }

  tags = {
    Name = "aurora-data-room-api"
  }
}

resource "aws_apigatewayv2_stage" "production" {
  api_id      = aws_apigatewayv2_api.data_room.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId         = "$context.requestId"
      sourceIp          = "$context.identity.sourceIp"
      requestTime       = "$context.requestTime"
      protocol          = "$context.protocol"
      httpMethod        = "$context.httpMethod"
      resourcePath      = "$context.resourcePath"
      routeKey          = "$context.routeKey"
      status            = "$context.status"
      responseLength    = "$context.responseLength"
      integrationError  = "$context.integrationErrorMessage"
      authorizerError   = "$context.authorizer.error"
      authorizerLatency = "$context.authorizer.integrationLatency"
    })
  }

  default_route_settings {
    throttling_burst_limit = 100
    throttling_rate_limit  = 50
  }
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/api-gateway/${var.project_name}-${var.environment}"
  retention_in_days = 30
}

# =============================================================================
# CloudFront - Content Delivery
# =============================================================================

resource "aws_cloudfront_distribution" "data_room" {
  enabled             = true
  is_ipv6_enabled    = true
  price_class        = "PriceClass_100"
  http_version       = "http2"

  aliases = [var.domain_name]

  origin {
    domain_name = "${aws_apigatewayv2_api.data_room.api_endpoint}"
    origin_id   = "api-gateway"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    domain_name = aws_s3_bucket.watermarked.website_endpoint
    origin_id   = "s3-watermarked"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "api-gateway"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type", "Origin"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    compress               = true
  }

  ordered_cache_behavior {
    path_pattern     = "/api/documents/download/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "s3-watermarked"

    forwarded_values {
      query_string = true
      headers      = ["Authorization"]
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true

    lambda_function_association {
      event_type   = "viewer-request"
      lambda_arn   = aws_lambda_function.auth_validator.qualified_arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.acm_certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  web_acl_id = aws_wafv2_web_acl.data_room.arn

  custom_error_response {
    error_code         = 403
    response_code      = 403
    response_page_path = "/error/403.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/error/404.html"
  }

  tags = {
    Name = "aurora-data-room-cloudfront"
  }
}

# =============================================================================
# WAF - Web Application Firewall
# =============================================================================

resource "aws_wafv2_web_acl" "data_room" {
  name        = "${var.project_name}-waf-${var.environment}"
  description = "WAF for Aurora Data Room"
  scope       = "CLOUDFRONT"

  default_action {
    allow {}
  }

  # Rate limiting
  rule {
    name     = "RateLimitRule"
    priority = 1

    override_action {
      none {}
    }

    statement {
      rate_based_statement {
        limit              = 1000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "RateLimitRule"
      sampled_requests_enabled  = true
    }
  }

  # AWS Managed Rules - Core Rule Set
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 2

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "AWSManagedRulesCommonRuleSet"
      sampled_requests_enabled  = true
    }
  }

  # AWS Managed Rules - SQL Injection
  rule {
    name     = "AWSManagedRulesSQLiRuleSet"
    priority = 3

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "AWSManagedRulesSQLiRuleSet"
      sampled_requests_enabled  = true
    }
  }

  # AWS Managed Rules - Known Bad Inputs
  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 4

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name               = "AWSManagedRulesKnownBadInputsRuleSet"
      sampled_requests_enabled  = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name               = "${var.project_name}-waf-metrics"
    sampled_requests_enabled  = true
  }

  tags = {
    Name = "aurora-data-room-waf"
  }
}

# =============================================================================
# CloudWatch - Logging and Monitoring
# =============================================================================

resource "aws_cloudwatch_log_group" "lambda_cognito" {
  name              = "/aws/lambda/${var.project_name}-cognito-triggers-${var.environment}"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "lambda_document_processor" {
  name              = "/aws/lambda/${var.project_name}-document-processor-${var.environment}"
  retention_in_days = 30
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "api_latency" {
  alarm_name          = "${var.project_name}-api-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name        = "Latency"
  namespace          = "AWS/ApiGateway"
  period             = 300
  statistic          = "Average"
  threshold          = 2000
  alarm_description  = "API latency exceeds 2 seconds"

  dimensions = {
    ApiName = aws_apigatewayv2_api.data_room.name
    Stage   = var.environment
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Name = "aurora-data-room-api-latency-alarm"
  }
}

resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "${var.project_name}-api-5xx-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name        = "5XXError"
  namespace          = "AWS/ApiGateway"
  period             = 300
  statistic          = "Sum"
  threshold          = 5
  alarm_description  = "API 5XX errors exceed threshold"

  dimensions = {
    ApiName = aws_apigatewayv2_api.data_room.name
    Stage   = var.environment
  }

  alarm_actions = [aws_sns_topic.alerts.arn]

  tags = {
    Name = "aurora-data-room-api-5xx-alarm"
  }
}

# SNS Topic for alerts
resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts-${var.environment}"

  tags = {
    Name = "aurora-data-room-alerts"
  }
}

# =============================================================================
# SES - Email Service
# =============================================================================

resource "aws_ses_domain_identity" "data_room" {
  domain = var.domain_name
}

resource "aws_ses_domain_dkim" "data_room" {
  domain = aws_ses_domain_identity.data_room.domain
}

resource "aws_ses_domain_identity_verification" "data_room" {
  domain = aws_ses_domain_identity.data_room.id

  depends_on = [aws_route53_record.ses_verification]
}

# SES Configuration Set for tracking
resource "aws_ses_configuration_set" "data_room" {
  name = "${var.project_name}-config-set-${var.environment}"

  reputation_metrics_enabled = true
  sending_enabled           = true

  tracking_options {
    custom_redirect_domain = var.domain_name
  }
}

# Event publishing to CloudWatch
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "cloudwatch-logs"
  configuration_set_name = aws_ses_configuration_set.data_room.name
  enabled                = true
  matching_types         = ["send", "reject", "bounce", "complaint", "delivery", "open", "click", "renderingFailure"]

  cloudwatch_destination {
    default_value  = "1"
    dimension_name = "ses-event"
    value_source   = "emailHeader"
  }
}

# =============================================================================
# Route 53 - DNS Records
# =============================================================================

resource "aws_route53_zone" "data_room" {
  name = var.domain_name

  tags = {
    Name = "aurora-data-room-zone"
  }
}

resource "aws_route53_record" "data_room" {
  zone_id = aws_route53_zone.data_room.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.data_room.domain_name
    zone_id                = aws_cloudfront_distribution.data_room.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.data_room.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.data_room.domain_name
    zone_id                = aws_cloudfront_distribution.data_room.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "ses_verification" {
  zone_id = aws_route53_zone.data_room.zone_id
  name    = "_amazonses.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = [aws_ses_domain_identity.data_room.verification_token]
}

resource "aws_route53_record" "ses_dkim" {
  count   = 3
  zone_id = aws_route53_zone.data_room.zone_id
  name    = "${aws_ses_domain_dkim.data_room.dkim_tokens[count.index]}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.data_room.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

# MX record for inbound email
resource "aws_route53_record" "mx" {
  zone_id = aws_route53_zone.data_room.zone_id
  name    = var.domain_name
  type    = "MX"
  ttl     = 600
  records = [
    "10 inbound-smtp.${var.aws_region}.amazonaws.com"
  ]
}

# =============================================================================
# CloudTrail - Audit Trail
# =============================================================================

resource "aws_cloudtrail" "data_room" {
  name                          = "${var.project_name}-cloudtrail-${var.environment}"
  s3_bucket_name                = aws_s3_bucket.cloudtrail.id
  include_global_service_events = true
  is_multi_region_trail        = false
  enable_log_file_validation   = true
  kms_key_id                   = aws_kms_key.data_room.arn

  event_selector {
    read_write_type           = "All"
    include_management_events = true

    data_resource {
      type   = "AWS::S3::Object"
      values = [
        "${aws_s3_bucket.documents.arn}/",
        "${aws_s3_bucket.watermarked.arn}/"
      ]
    }
  }

  tags = {
    Name = "aurora-data-room-cloudtrail"
  }
}

resource "aws_s3_bucket" "cloudtrail" {
  bucket        = "${var.project_name}-cloudtrail-${var.environment}"
  force_destroy = var.environment != "production"

  tags = {
    Name = "aurora-data-room-cloudtrail"
  }
}

resource "aws_s3_bucket_policy" "cloudtrail" {
  bucket = aws_s3_bucket.cloudtrail.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AWSCloudTrailAclCheck"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:GetBucketAcl"
        Resource = aws_s3_bucket.cloudtrail.arn
      },
      {
        Sid    = "AWSCloudTrailWrite"
        Effect = "Allow"
        Principal = {
          Service = "cloudtrail.amazonaws.com"
        }
        Action   = "s3:PutObject"
        Resource = "${aws_s3_bucket.cloudtrail.arn}/*"
        Condition = {
          StringEquals = {
            "s3:x-amz-acl" = "bucket-owner-full-control"
          }
        }
      }
    ]
  })
}

# =============================================================================
# Outputs
# =============================================================================

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.data_room.id
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.data_room.domain_name
}

output "api_gateway_endpoint" {
  value = aws_apigatewayv2_api.data_room.api_endpoint
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.data_room.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.web_app.id
}

output "cognito_domain" {
  value = aws_cognito_user_pool_domain.data_room.domain
}

output "documents_bucket_name" {
  value = aws_s3_bucket.documents.id
}

output "watermarked_bucket_name" {
  value = aws_s3_bucket.watermarked.id
}

output "metadata_table_name" {
  value = aws_dynamodb_table.metadata.name
}

output "audit_logs_table_name" {
  value = aws_dynamodb_table.audit_logs.name
}

output "sns_alerts_topic_arn" {
  value = aws_sns_topic.alerts.arn
}

output "nameservers" {
  value = aws_route53_zone.data_room.name_servers
  description = "Nameservers to configure at domain registrar"
}
