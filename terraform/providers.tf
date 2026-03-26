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
# Manages Neon database projects and resources
# org_id is set via environment variable NEON_ORG_ID

provider "neon" {
  api_key = var.neon_api_key
}

# ============================================================================
# POSTGRESQL PROVIDER CONFIGURATION
# ============================================================================
# Manages PostgreSQL database objects (tables, schemas, etc.)

provider "postgresql" {
  host            = neon_project.main.database_host
  port            = 5432
  database        = neon_database.n8n_db.name
  username        = neon_role.n8n_user.name
  password        = neon_role.n8n_user.password
  sslmode         = "require"
  connect_timeout = 15
}