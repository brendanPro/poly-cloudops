# Google Cloud Platform provider configuration
# Configures authentication and default settings for GCP resources

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone

  # Default labels applied to all resources
  default_labels = {
    managed_by  = "terraform"
    project     = "poly-cloudops"
    environment = var.environment
  }
}

# Provider configuration for beta features (if needed in the future)
provider "google-beta" {
  project = var.project_id
  region  = var.region
  zone    = var.zone

  default_labels = {
    managed_by  = "terraform"
    project     = "poly-cloudops"
    environment = var.environment
  }
}

# ============================================================================
# NEON PROVIDER CONFIGURATION
# ============================================================================
# Used to fetch connection strings from your existing Neon database

provider "neon" {
  api_key = var.neon_api_key
}