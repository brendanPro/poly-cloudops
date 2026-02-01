# ============================================================================
# TERRAFORM OUTPUTS
# ============================================================================
# Values that will be displayed after terraform apply

# ============================================================================
# CLOUD RUN OUTPUTS
# ============================================================================

output "n8n_service_url" {
  description = "The URL of the deployed n8n Cloud Run service"
  value       = google_cloud_run_v2_service.n8n.uri
}

output "n8n_service_name" {
  description = "The name of the Cloud Run service"
  value       = google_cloud_run_v2_service.n8n.name
}

output "n8n_service_location" {
  description = "The location/region of the Cloud Run service"
  value       = google_cloud_run_v2_service.n8n.location
}

output "n8n_service_latest_revision" {
  description = "The latest revision name of the Cloud Run service"
  value       = google_cloud_run_v2_service.n8n.latest_ready_revision
}

# ============================================================================
# ARTIFACT REGISTRY OUTPUTS
# ============================================================================

output "artifact_registry_repository_url" {
  description = "The full URL of the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.n8n_repo.repository_id}"
}

output "artifact_registry_repository_name" {
  description = "The name of the Artifact Registry repository"
  value       = google_artifact_registry_repository.n8n_repo.name
}

output "docker_push_command" {
  description = "Command to push Docker images to Artifact Registry"
  value       = "docker push ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.n8n_repo.repository_id}/n8n:latest"
}

# ============================================================================
# IAM OUTPUTS
# ============================================================================

output "cloudrun_service_account_email" {
  description = "Email of the Cloud Run service account"
  value       = google_service_account.cloudrun_sa.email
}

output "cloudrun_service_account_name" {
  description = "Name of the Cloud Run service account"
  value       = google_service_account.cloudrun_sa.name
}

# ============================================================================
# STORAGE OUTPUTS
# ============================================================================

output "storage_bucket_name" {
  description = "Name of the Cloud Storage bucket (if created)"
  value       = var.create_storage_bucket ? google_storage_bucket.n8n_storage[0].name : "Not created"
}

output "storage_bucket_url" {
  description = "URL of the Cloud Storage bucket (if created)"
  value       = var.create_storage_bucket ? google_storage_bucket.n8n_storage[0].url : "Not created"
}

# ============================================================================
# SECRET MANAGER OUTPUTS
# ============================================================================

output "secret_names" {
  description = "Names of the secrets referenced by Cloud Run"
  value = {
    encryption_key       = data.google_secret_manager_secret.n8n_encryption_key.secret_id
    db_connection_string = data.google_secret_manager_secret.db_connection_string.secret_id
    deepl_api_key        = data.google_secret_manager_secret.deepl_api_key.secret_id
  }
}

# ============================================================================
# HELPFUL COMMANDS
# ============================================================================

output "helpful_commands" {
  description = "Useful commands for managing the deployment"
  value = {
    view_logs        = "gcloud run services logs read ${google_cloud_run_v2_service.n8n.name} --region=${var.region} --limit=50"
    describe_service = "gcloud run services describe ${google_cloud_run_v2_service.n8n.name} --region=${var.region}"
    open_n8n         = "open ${google_cloud_run_v2_service.n8n.uri}"
    configure_docker = "gcloud auth configure-docker ${var.region}-docker.pkg.dev"
    tag_image        = "docker tag n8nio/n8n:latest ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.n8n_repo.repository_id}/n8n:latest"
  }
}

# ============================================================================
# PROJECT INFORMATION
# ============================================================================

output "project_info" {
  description = "Project information"
  value = {
    project_id     = var.project_id
    project_number = data.google_project.project.number
    region         = var.region
    environment    = var.environment
  }
}
