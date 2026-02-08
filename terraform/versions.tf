# ============================================================================
# TERRAFORM VERSION & PROVIDER CONSTRAINTS
# ============================================================================
# This file defines the minimum versions required for Terraform and its providers

terraform {
  # Require Terraform version 1.0 or higher
  required_version = ">= 1.0"

  required_providers {
    # Google Cloud Platform provider
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0" 
    }

    # Neon provider for database management (fetching existing project data)
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.2.0"
    }

    # Random provider for generating unique IDs
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
} 