# Aurora OSI Data Room - Terraform Variables
# ============================================

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., production, staging, development)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "aurora-dataroom"
}

variable "domain_name" {
  description = "Primary domain name for the data room"
  type        = string
  default     = "data-room.aurora-osi.com"
}

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for SSL/TLS"
  type        = string
  # Required: Obtain from AWS Certificate Manager in us-east-1
}

variable "alert_email" {
  description = "Email address for CloudWatch alerts"
  type        = string
  default     = "alerts@aurora-osi.com"
}

variable "admin_emails" {
  description = "List of admin email addresses"
  type        = list(string)
  default     = ["admin@aurora-osi.com"]
}

variable "allowed_ip_ranges" {
  description = "IP ranges allowed to access the data room (optional)"
  type        = list(string)
  default     = []
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

variable "audit_log_retention_days" {
  description = "Number of days to retain audit logs in DynamoDB (TTL)"
  type        = number
  default     = 2555  # 7 years for compliance
}

variable "enable_mfa" {
  description = "Require MFA for all users"
  type        = bool
  default     = true
}

variable "session_timeout_hours" {
  description = "Session timeout in hours"
  type        = number
  default     = 24
}

variable "max_document_size_mb" {
  description = "Maximum document upload size in MB"
  type        = number
  default     = 100
}

variable "watermark_enabled" {
  description = "Enable automatic watermarking of documents"
  type        = bool
  default     = true
}

variable "watermark_text" {
  description = "Text to use for watermarking documents"
  type        = string
  default     = "CONFIDENTIAL - Aurora OSI Data Room"
}

variable "rate_limit_requests" {
  description = "Maximum requests per 5-minute window per IP"
  type        = number
  default     = 1000
}

variable "enable_geo_restriction" {
  description = "Enable geographic access restrictions"
  type        = bool
  default     = false
}

variable "allowed_countries" {
  description = "List of country codes allowed if geo-restriction is enabled"
  type        = list(string)
  default     = ["US", "GB", "CA", "AU"]
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}

# =============================================================================
# Environment-specific variable sets
# =============================================================================

# For development environment:
# environment = "development"
# domain_name = "dev-data-room.aurora-osi.com"
# enable_mfa = false
# log_retention_days = 7

# For staging environment:
# environment = "staging"
# domain_name = "staging-data-room.aurora-osi.com"
# enable_mfa = true
# log_retention_days = 14

# For production environment:
# environment = "production"
# domain_name = "data-room.aurora-osi.com"
# enable_mfa = true
# log_retention_days = 30
# audit_log_retention_days = 2555
