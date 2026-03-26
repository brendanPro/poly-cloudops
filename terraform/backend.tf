# Backend configuration for storing Terraform state in Google Cloud Storage
# This enables team collaboration, state locking, and backup/versioning

terraform {
  backend "gcs" {
    bucket = "polycloudops-terraform-state"

    # Path prefix within the bucket
    prefix = "terraform/state"
  }
}

# Note: The GCS bucket was created manually before running terraform init using:
# gcloud storage buckets create gs://polycloudops-terraform-state \
#   --project=polycloudops \
#   --location=europe-west1 \
#   --uniform-bucket-level-access \
#   --versioning
