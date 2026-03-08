# ============================================================================
# PROJECT CONFIGURATION
# ============================================================================

variable "project_id" {
  description = "The GCP project ID"
  type        = string
  default     = "polycloudops"
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "europe-west1"
}

variable "zone" {
  description = "The GCP zone for resources"
  type        = string
  default     = "europe-west1-b"
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  default     = "staging"
}

# ============================================================================
# ARTIFACT REGISTRY CONFIGURATION
# ============================================================================

# ============================================================================
# ARTIFACT REGISTRY VARIABLES - COMMENTED OUT
# ============================================================================
# Using official n8nio/n8n:2.10.4 image from Docker Hub
# Uncomment these if you need to build custom images
# 
# variable "artifact_registry_repository_id" {
#   description = "The ID of the Artifact Registry repository for Docker images"
#   type        = string
#   default     = "n8n-repo"
# }
# 
# variable "artifact_registry_description" {
#   description = "Description for the Artifact Registry repository"
#   type        = string
#   default     = "Docker repository for n8n custom images"
# }

# ============================================================================
# CLOUD RUN CONFIGURATION
# ============================================================================

variable "cloudrun_service_name" {
  description = "Name of the Cloud Run service"
  type        = string
  default     = "n8n-service"
}

variable "cloudrun_image" {
  description = "Docker image for Cloud Run service"
  type        = string
  default     = "n8nio/n8n:2.10.4"
}

variable "cloudrun_cpu" {
  description = "Number of vCPUs for each Cloud Run instance"
  type        = string
  default     = "1"
}

variable "cloudrun_memory" {
  description = "Memory allocation for each Cloud Run instance"
  type        = string
  default     = "1Gi"
}

variable "cloudrun_min_instances" {
  description = "Minimum number of Cloud Run instances (0 for true serverless)"
  type        = number
  default     = 0
}

variable "cloudrun_max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 10
}

variable "cloudrun_concurrency" {
  description = "Maximum number of concurrent requests per instance"
  type        = number
  default     = 80
}

variable "cloudrun_timeout" {
  description = "Request timeout in seconds"
  type        = number
  default     = 300
}

variable "cloudrun_cpu_throttling" {
  description = "Whether to throttle CPU when no requests (set to false for background tasks)"
  type        = bool
  default     = true
}

variable "cloudrun_allow_unauthenticated" {
  description = "Whether to allow unauthenticated access to Cloud Run service"
  type        = bool
  default     = true
}

# variable "db_host" { type = string }
# variable "db_user" { type = string; default = "neondb_owner" }
# variable "db_password" { type = string; sensitive = true }
# variable "db_name" { type = string; default = "neondb" }

# ============================================================================
# N8N APPLICATION CONFIGURATION
# ============================================================================

variable "n8n_port" {
  description = "Port on which n8n listens"
  type        = number
  default     = 5678
}

variable "n8n_timezone" {
  description = "Timezone for n8n workflows"
  type        = string
  default     = "Europe/Paris"
}

variable "n8n_protocol" {
  description = "Protocol for n8n (http or https)"
  type        = string
  default     = "https"
}

variable "n8n_executions_process" {
  description = "How to handle workflow executions (main or own)"
  type        = string
  default     = "main"
}

variable "n8n_admin_email" {
  description = "Email address for n8n admin user"
  type        = string
  default     = "admin@cloudops.com"
  sensitive   = false
}

variable "n8n_admin_password" {
  description = "Password for n8n admin user"
  type        = string
  sensitive   = true
}

# ============================================================================
# SECRET MANAGER CONFIGURATION
# ============================================================================

variable "secret_n8n_encryption_key" {
  description = "Name of the secret containing n8n encryption key"
  type        = string
  default     = "n8n-encryption-key"
}

variable "secret_db_connection_string" {
  description = "Name of the secret containing database connection string"
  type        = string
  default     = "n8n-db-connection-string"
}

variable "secret_deepl_api_key" {
  description = "Name of the secret containing DeepL API key"
  type        = string
  default     = "deepl-api-key"
}

variable "neon_api_key" {
  description = "Neon API key for managing database resources"
  type        = string
  sensitive   = true
}

variable "neon_org_id" {
  description = "Neon organization ID (found in https://console.neon.tech/app/settings/organizations)"
  type        = string
}

# ============================================================================
# CLOUD STORAGE CONFIGURATION
# ============================================================================

variable "create_storage_bucket" {
  description = "Whether to create a Cloud Storage bucket for application data"
  type        = bool
  default     = false
}

variable "storage_bucket_name" {
  description = "Name for the Cloud Storage bucket (must be globally unique)"
  type        = string
  default     = "polycloudops-n8n-storage"
}

variable "storage_bucket_location" {
  description = "Location for the Cloud Storage bucket"
  type        = string
  default     = "EU" # Multi-region in Europe
}

variable "storage_bucket_storage_class" {
  description = "Storage class for the bucket"
  type        = string
  default     = "STANDARD"
}

variable "storage_bucket_versioning" {
  description = "Enable versioning for the storage bucket"
  type        = bool
  default     = true
}

# ============================================================================
# IAM CONFIGURATION
# ============================================================================

variable "cloudrun_service_account_name" {
  description = "Name for the Cloud Run service account"
  type        = string
  default     = "n8n-cloudrun-sa"
}

variable "cloudrun_service_account_display_name" {
  description = "Display name for the Cloud Run service account"
  type        = string
  default     = "n8n Cloud Run Service Account"
}
