# ============================================================================
# CLOUD STORAGE CONFIGURATION
# ============================================================================
# Optional Cloud Storage bucket for n8n workflow exports, file storage, etc.
# Set create_storage_bucket = true in terraform.tfvars to enable

resource "google_storage_bucket" "n8n_storage" {
  count = var.create_storage_bucket ? 1 : 0

  project  = var.project_id
  name     = var.storage_bucket_name
  location = var.storage_bucket_location

  # Storage class (STANDARD, NEARLINE, COLDLINE, ARCHIVE)
  storage_class = var.storage_bucket_storage_class

  # Enable versioning for file recovery
  versioning {
    enabled = var.storage_bucket_versioning
  }

  # Uniform bucket-level access (recommended)
  uniform_bucket_level_access = true

  # Lifecycle rules to manage storage costs
  lifecycle_rule {
    condition {
      age = 90 # Days
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE" # Move old files to cheaper storage
    }
  }

  # Lifecycle rule to delete very old files
  lifecycle_rule {
    condition {
      age = 365 # 1 year
    }
    action {
      type = "Delete"
    }
  }

  # Labels for organization
  labels = merge(
    local.common_labels,
    {
      purpose = "n8n-workflow-storage"
    }
  )

  # Force destroy (set to false in production to prevent accidental deletion)
  force_destroy = var.environment == "staging" ? true : false

  # Ensure Storage API is enabled first
  depends_on = [
    google_project_service.required_apis
  ]
}


