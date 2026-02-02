# ==========================================================================
# NETWORK CONFIGURATION
# ==========================================================================
# This file defines the Virtual Private Cloud (VPC) infrastructure.
# Although Cloud Run is a serverless product, defining a custom VPC is a 
# security best practice to isolate cloud resources and manage future 
# private connectivity (e.g., via Serverless VPC Access connectors).

# Custom VPC Network
resource "google_compute_network" "main_vpc" {
  name                    = "${var.project_id}-vpc"
  auto_create_subnetworks = false # Best practice: disable auto-subnet for better control
  routing_mode            = "REGIONAL"
  description             = "Main VPC for Poly-CloudOps infrastructure"
}

# Public Subnet for regional resources
resource "google_compute_subnetwork" "public_subnet" {
  name          = "${var.project_id}-public-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.main_vpc.id
  
  # Enabling flow logs for network monitoring and auditing
  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# Firewall rule to allow internal traffic within the VPC
resource "google_compute_firewall" "allow_internal" {
  name    = "${var.project_id}-allow-internal"
  network = google_compute_network.main_vpc.name

  allow {
    protocol = "icmp"
  }

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  source_ranges = ["10.0.1.0/24"]
}