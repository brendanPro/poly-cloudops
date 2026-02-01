# Terraform version constraints and required providers
# This file defines the minimum versions required for Terraform and its providers

terraform {
  # Require Terraform version 1.0 or higher
  required_version = ">= 1.0"

  required_providers {
    # Google Cloud Platform provider
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0" # Use 6.x versions (latest stable)
    }

    # Random provider for generating unique IDs if needed
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}
