# ============================================================================
# NEON DATABASE INFRASTRUCTURE - MANAGED BY TERRAFORM
# ============================================================================
# This file creates and manages the complete Neon database infrastructure
# including project, database, roles, and endpoints

# ============================================================================
# NEON PROJECT
# ============================================================================
resource "neon_project" "main" {
  name                      = "poly-cloudops-${var.environment}"
  org_id                    = var.neon_org_id
  history_retention_seconds = 21600 # 6 hours (maximum allowed by Neon)

  lifecycle {
    prevent_destroy = true # Prevent accidental deletion of the database
  }
}

# ============================================================================
# NEON DATABASE
# ============================================================================
# Create the main database for n8n
resource "neon_database" "n8n_db" {
  project_id = neon_project.main.id
  branch_id  = neon_project.main.default_branch_id
  name       = "n8n_db"
  owner_name = neon_role.n8n_user.name

  depends_on = [neon_role.n8n_user]
}

# ============================================================================
# NEON ROLE (DATABASE USER)
# ============================================================================
# Create a dedicated user for n8n with its own credentials
resource "neon_role" "n8n_user" {
  project_id = neon_project.main.id
  branch_id  = neon_project.main.default_branch_id
  name       = "n8n_app_user"
}

# ============================================================================
# NEON ENDPOINT
# ============================================================================
# NOTE: Neon automatically creates a default read_write endpoint when the 
# project is created, so we use it instead of creating a new one

# ============================================================================
# DATABASE CONNECTION STRING
# ============================================================================
# Build the PostgreSQL connection string for n8n
locals {
  # Use the default endpoint created by Neon
  db_host_endpoint = neon_project.main.database_host_pooler

  # Connection string using connection pooler (recommended for serverless)
  db_connection_string_pooler = "postgresql://${neon_role.n8n_user.name}:${neon_role.n8n_user.password}@${local.db_host_endpoint}/${neon_database.n8n_db.name}?sslmode=require"

  # Direct connection string (without pooler)
  db_connection_string_direct = "postgresql://${neon_role.n8n_user.name}:${neon_role.n8n_user.password}@${neon_project.main.database_host}/${neon_database.n8n_db.name}?sslmode=require"

  # Parse connection string components
  db_host     = neon_project.main.database_host
  db_user     = neon_role.n8n_user.name
  db_password = neon_role.n8n_user.password
  db_database = neon_database.n8n_db.name
}

# ============================================================================
# GOOGLE SECRET MANAGER - DATABASE CREDENTIALS
# ============================================================================
# Use existing secrets and create/update their versions

# Connection String Secret (with pooler - recommended)
data "google_secret_manager_secret" "db_connection_string" {
  project   = var.project_id
  secret_id = var.secret_db_connection_string
}

resource "google_secret_manager_secret_version" "db_connection_string" {
  secret      = data.google_secret_manager_secret.db_connection_string.id
  secret_data = local.db_connection_string_pooler
}

# Database Host Secret
data "google_secret_manager_secret" "db_host" {
  project   = var.project_id
  secret_id = "db-host"
}

resource "google_secret_manager_secret_version" "db_host" {
  secret      = data.google_secret_manager_secret.db_host.id
  secret_data = local.db_host
}

# Database User Secret
data "google_secret_manager_secret" "db_user" {
  project   = var.project_id
  secret_id = "db-user"
}

resource "google_secret_manager_secret_version" "db_user" {
  secret      = data.google_secret_manager_secret.db_user.id
  secret_data = local.db_user
}

# Database Password Secret
data "google_secret_manager_secret" "db_password" {
  project   = var.project_id
  secret_id = "db-password"
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = data.google_secret_manager_secret.db_password.id
  secret_data = local.db_password
}

# Database Name Secret
data "google_secret_manager_secret" "db_database" {
  project   = var.project_id
  secret_id = "db-database"
}

resource "google_secret_manager_secret_version" "db_database" {
  secret      = data.google_secret_manager_secret.db_database.id
  secret_data = local.db_database
}

# ============================================================================
# IAM PERMISSIONS - CLOUD RUN ACCESS TO SECRETS
# ============================================================================
# Grant the Cloud Run service account access to database secrets

resource "google_secret_manager_secret_iam_member" "db_connection_string_access" {
  project   = var.project_id
  secret_id = data.google_secret_manager_secret.db_connection_string.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "db_host_access" {
  project   = var.project_id
  secret_id = data.google_secret_manager_secret.db_host.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "db_user_access" {
  project   = var.project_id
  secret_id = data.google_secret_manager_secret.db_user.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "db_password_access" {
  project   = var.project_id
  secret_id = data.google_secret_manager_secret.db_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_secret_manager_secret_iam_member" "db_database_access" {
  project   = var.project_id
  secret_id = data.google_secret_manager_secret.db_database.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# ============================================================================
# DATABASE SCHEMA - TABLES
# ============================================================================
# Create application tables in the n8n database

resource "postgresql_default_privileges" "public_schema" {
  database    = neon_database.n8n_db.name
  role        = neon_role.n8n_user.name
  owner       = neon_role.n8n_user.name
  schema      = "public"
  object_type = "table"
  privileges  = ["SELECT", "INSERT", "UPDATE", "DELETE"]
}

# Create translations table using PostgreSQL container (like docker-compose db-bootstrap)
resource "null_resource" "create_translations_table" {
  provisioner "local-exec" {
    # Launch postgres client directly via Docker - works on Windows, Linux, macOS
    command = "docker run --rm -v ${abspath(path.module)}/scripts/setup-translations-table.sql:/script.sql:ro -e PGPASSWORD=${neon_role.n8n_user.password} postgres:16-alpine psql -h ${neon_project.main.database_host} -U ${neon_role.n8n_user.name} -d ${neon_database.n8n_db.name} -f /script.sql"
  }

  depends_on = [
    neon_database.n8n_db,
    neon_role.n8n_user,
    google_secret_manager_secret_version.db_connection_string
  ]

  triggers = {
    # Re-run if connection string or script changes
    db_host     = neon_project.main.database_host
    db_name     = neon_database.n8n_db.name
    db_user     = neon_role.n8n_user.name
    script_hash = filemd5("${path.module}/scripts/setup-translations-table.sql")
  }
}

# ============================================================================
# BOOTSTRAP N8N DATABASE
# ============================================================================
# Execute n8n setup script (create admin user, settings, etc.)
# NOTE: This runs AFTER Cloud Run deployment so n8n has time to initialize tables
resource "null_resource" "bootstrap_n8n" {
  provisioner "local-exec" {
    # Wait via Docker, then launch postgres client - works on Windows, Linux, macOS
    command = "docker run --rm alpine sleep 20 && docker run --rm -v ${abspath(path.module)}/../bootstrap/setup-n8n.sql:/script.sql:ro -e PGPASSWORD=${neon_role.n8n_user.password} postgres:16-alpine psql -h ${neon_project.main.database_host} -U ${neon_role.n8n_user.name} -d ${neon_database.n8n_db.name} -v admin_email='${var.n8n_admin_email}' -v admin_password='${var.n8n_admin_password}' -f /script.sql"
  }

  depends_on = [
    null_resource.create_translations_table,
    google_cloud_run_v2_service.n8n
  ]

  triggers = {
    db_host     = neon_project.main.database_host
    db_name     = neon_database.n8n_db.name
    script_hash = filemd5("${path.module}/../bootstrap/setup-n8n.sql")
    admin_email = var.n8n_admin_email
  }
}