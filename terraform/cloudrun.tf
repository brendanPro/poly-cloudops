# ============================================================================
# CLOUD RUN SERVICE CONFIGURATION
# ============================================================================
# Deploys n8n as a serverless container on Cloud Run

resource "google_cloud_run_v2_service" "n8n" {
  project             = var.project_id
  name                = var.cloudrun_service_name
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_ALL"
  deletion_protection = false

  labels = merge(
    local.common_labels,
    {
      application = "n8n"
      tier        = "application"
    }
  )

  template {
    service_account = google_service_account.cloudrun_sa.email

    scaling {
      min_instance_count = var.cloudrun_min_instances
      max_instance_count = var.cloudrun_max_instances
    }

    timeout = "${var.cloudrun_timeout}s"

    containers {
      image = var.cloudrun_image

      resources {
        limits = {
          cpu    = var.cloudrun_cpu
          memory = var.cloudrun_memory
        }
        cpu_idle          = var.cloudrun_cpu_throttling
        startup_cpu_boost = true
      }

      ports {
        name           = "http1"
        container_port = var.n8n_port
      }

      startup_probe {
        initial_delay_seconds = 20
        timeout_seconds       = 5
        period_seconds        = 5
        failure_threshold     = 10
        http_get {
          path = "/healthz"
          port = var.n8n_port
        }
      }

      liveness_probe {
        initial_delay_seconds = 30
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 3
        http_get {
          path = "/healthz"
          port = var.n8n_port
        }
      }

      # --- Database Configuration (Individual Parameters) ---
      env {
        name  = "DB_TYPE"
        value = "postgresdb"
      }

      env {
        name = "DB_POSTGRESDB_HOST"
        value_source {
          secret_key_ref {
            secret  = "db-host"
            version = "latest"
          }
        }
      }

      env {
        name  = "DB_POSTGRESDB_PORT"
        value = "5432"
      }

      env {
        name = "DB_POSTGRESDB_DATABASE"
        value_source {
          secret_key_ref {
            secret  = "db-database"
            version = "latest"
          }
        }
      }

      env {
        name = "DB_POSTGRESDB_USER"
        value_source {
          secret_key_ref {
            secret  = "db-user"
            version = "latest"
          }
        }
      }

      env {
        name = "DB_POSTGRESDB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = "db-password"
            version = "latest"
          }
        }
      }

      env {
        name  = "DB_POSTGRESDB_SSL_ENABLED"
        value = "true"
      }

      env {
        name  = "DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED"
        value = "false" # Matches docker-compose for Neon compatibility
      }

      # --- n8n Security & Session ---
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

      env {
        name  = "N8N_COOKIES_SAMESITE"
        value = "lax" # Added to match docker-compose
      }

      # --- n8n Server Configuration ---
      env {
        name  = "N8N_HOST"
        value = "0.0.0.0" # Required for Cloud Run to bind properly
      }

      env {
        name  = "N8N_PORT"
        value = tostring(var.n8n_port)
      }

      env {
        name  = "N8N_PROTOCOL"
        value = "https" # Cloud Run uses HTTPS for external traffic
      }

      env {
        name  = "WEBHOOK_URL"
        value = "https://${var.cloudrun_service_name}-${data.google_project.project.number}.${var.region}.run.app/"
      }

      env {
        name  = "GENERIC_TIMEZONE"
        value = var.n8n_timezone
      }

      # --- n8n Executions (Aligned with Docker-Compose) ---
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
        value = "168"
      }

      # --- Integrations ---
      env {
        name = "DEEPL_API_KEY"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.deepl_api_key.secret_id
            version = "latest"
          }
        }
      }

      # --- Cloud Storage Dynamic Envs ---
      dynamic "env" {
        for_each = var.create_storage_bucket ? [1] : []
        content {
          name  = "GCS_BUCKET_NAME"
          value = var.storage_bucket_name
        }
      }

      dynamic "env" {
        for_each = var.create_storage_bucket ? [1] : []
        content {
          name  = "GOOGLE_CLOUD_PROJECT"
          value = var.project_id
        }
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [
    google_project_service.required_apis,
    google_service_account.cloudrun_sa,
    google_secret_manager_secret_iam_member.db_connection_string_access,
    google_secret_manager_secret_iam_member.db_host_access,
    google_secret_manager_secret_iam_member.db_user_access,
    google_secret_manager_secret_iam_member.db_password_access,
    google_secret_manager_secret_iam_member.db_database_access,
    # google_artifact_registry_repository.n8n_repo,  # Using Docker Hub official image
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