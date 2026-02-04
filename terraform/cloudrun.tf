# ============================================================================
# CLOUD RUN SERVICE CONFIGURATION
# ============================================================================
# Deploys n8n as a serverless container on Cloud Run

resource "google_cloud_run_v2_service" "n8n" {
  project  = var.project_id
  name     = var.cloudrun_service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL" # Allow all traffic

  labels = merge(
    local.common_labels,
    {
      application = "n8n"
      tier        = "application"
    }
  )

  template {
    # Service account for this Cloud Run service
    service_account = google_service_account.cloudrun_sa.email

    # Scaling configuration
    scaling {
      min_instance_count = var.cloudrun_min_instances
      max_instance_count = var.cloudrun_max_instances
    }

    # Request timeout (in seconds)
    timeout = "${var.cloudrun_timeout}s"

    containers {
      # Docker image from Artifact Registry
      image = var.cloudrun_image

      # Resource allocation
      resources {
        limits = {
          cpu    = var.cloudrun_cpu
          memory = var.cloudrun_memory
        }
        cpu_idle          = var.cloudrun_cpu_throttling
        startup_cpu_boost = true # Faster cold starts
      }

      # Container port
      ports {
        name           = "http1"
        container_port = var.n8n_port
      }

      # Startup probe (increased timeout for cold starts)
      startup_probe {
        initial_delay_seconds = 5
        timeout_seconds       = 5
        period_seconds        = 3
        failure_threshold     = 10
        http_get {
          path = "/healthz"
          port = var.n8n_port
        }
      }

      # Liveness probe
      liveness_probe {
        initial_delay_seconds = 10
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 3
        http_get {
          path = "/healthz"
          port = var.n8n_port
        }
      }

      # ========================================================================
      # ENVIRONMENT VARIABLES
      # ========================================================================

      # --- Database Configuration (from Secret Manager) ---
      env {
        name  = "DB_TYPE"
        value = "postgresdb"
      }

      # Parse Neon connection string for individual components
      # Note: In production, consider using a more robust secret structure
      # For now, we'll use a full connection string and let n8n parse it
      env {
        name = "DB_POSTGRESDB_CONNECTION_STRING"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.db_connection_string.secret_id
            version = "latest"
          }
        }
      }

      # SSL Configuration for Neon
      env {
        name  = "DB_POSTGRESDB_SSL_ENABLED"
        value = "true"
      }

      env {
        name  = "DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED"
        value = "false"
      }

      # --- n8n Security Configuration ---
      env {
        name = "N8N_ENCRYPTION_KEY"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.n8n_encryption_key.secret_id
            version = "latest"
          }
        }
      }

      env {
        name  = "N8N_BLOCK_ENV_ACCESS_IN_NODE"
        value = "false"
      }

      # --- n8n Server Configuration ---
      env {
        name  = "N8N_HOST"
        value = "0.0.0.0" # Listen on all interfaces
      }

      env {
        name  = "N8N_PORT"
        value = tostring(var.n8n_port)
      }

      env {
        name  = "N8N_PROTOCOL"
        value = var.n8n_protocol
      }

      # Webhook URL (will be set to Cloud Run URL after deployment)
      env {
        name  = "WEBHOOK_URL"
        value = "https://${var.cloudrun_service_name}-${data.google_project.project.number}.${var.region}.run.app/"
      }

      env {
        name  = "GENERIC_TIMEZONE"
        value = var.n8n_timezone
      }

      # --- n8n Execution Configuration ---
      env {
        name  = "N8N_EXECUTIONS_PROCESS"
        value = var.n8n_executions_process
      }

      env {
        name  = "EXECUTIONS_DATA_SAVE_ON_SUCCESS"
        value = "none"
      }

      env {
        name  = "EXECUTIONS_DATA_SAVE_ON_ERROR"
        value = "all"
      }

      env {
        name  = "EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS"
        value = "true"
      }

      env {
        name  = "EXECUTIONS_DATA_PRUNE"
        value = "true"
      }

      env {
        name  = "EXECUTIONS_DATA_MAX_AGE"
        value = "168" # 1 week
      }

      # --- API Integrations ---
      env {
        name = "DEEPL_API_KEY"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.deepl_api_key.secret_id
            version = "latest"
          }
        }
      }

      # --- Cloud Storage Configuration (if enabled) ---
      # GCS Bucket name for file storage (audio, exports, etc.)
      dynamic "env" {
        for_each = var.create_storage_bucket ? [1] : []
        content {
          name  = "GCS_BUCKET_NAME"
          value = var.storage_bucket_name
        }
      }

      # Project ID for GCS operations
      dynamic "env" {
        for_each = var.create_storage_bucket ? [1] : []
        content {
          name  = "GOOGLE_CLOUD_PROJECT"
          value = var.project_id
        }
      }

      # GCS Bucket region
      dynamic "env" {
        for_each = var.create_storage_bucket ? [1] : []
        content {
          name  = "GCS_BUCKET_REGION"
          value = var.storage_bucket_location
        }
      }

      # --- Cloud Run Specific ---
      env {
        name  = "PORT"
        value = tostring(var.n8n_port)
      }

    }
  }

  # Traffic configuration (100% to latest revision)
  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  # Ensure dependencies are created first
  depends_on = [
    google_project_service.required_apis,
    google_service_account.cloudrun_sa,
    google_secret_manager_secret_iam_member.cloudrun_sa_secret_accessor,
    google_artifact_registry_repository.n8n_repo,
  ]
}

# ============================================================================
# IAM POLICY FOR PUBLIC ACCESS
# ============================================================================

resource "google_cloud_run_v2_service_iam_member" "noauth" {
  count = var.cloudrun_allow_unauthenticated ? 1 : 0

  project  = google_cloud_run_v2_service.n8n.project
  location = google_cloud_run_v2_service.n8n.location
  name     = google_cloud_run_v2_service.n8n.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
