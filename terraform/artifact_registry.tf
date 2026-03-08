# ============================================================================
# ARTIFACT REGISTRY - COMMENTED OUT
# ============================================================================
# Using official n8nio/n8n:2.10.4 image from Docker Hub
# Uncomment this file if you need to build and store custom n8n images
# ============================================================================

# ============================================================================
# ARTIFACT REGISTRY CONFIGURATION
# ============================================================================
# Creates a Docker repository for storing n8n container images

# resource "google_artifact_registry_repository" "n8n_repo" {
#   project       = var.project_id
#   location      = var.region
#   repository_id = "${var.artifact_registry_repository_id}${local.env_suffix}"
#   description   = var.artifact_registry_description
#   format        = "DOCKER"
# 
#   labels = merge(
#     local.common_labels,
#     {
#       purpose = "n8n-container-images"
#     }
#   )
# 
#   # Ensure the Artifact Registry API is enabled first
#   depends_on = [
#     google_project_service.required_apis
#   ]
# }

# ============================================================================
# ARTIFACT REGISTRY IAM
# ============================================================================

# Allow the Cloud Run service account to pull images from Artifact Registry
# resource "google_artifact_registry_repository_iam_member" "cloudrun_reader" {
#   project    = google_artifact_registry_repository.n8n_repo.project
#   location   = google_artifact_registry_repository.n8n_repo.location
#   repository = google_artifact_registry_repository.n8n_repo.name
#   role       = "roles/artifactregistry.reader"
#   member     = "serviceAccount:${google_service_account.cloudrun_sa.email}"
# }

